var express = require('express')
var bodyParser = require('body-parser')
var conn = require('./db')
var cors = require('cors')
var http = require('http')
var aws = require('aws-sdk')
aws.config.loadFromPath(__dirname + "/s3/config.json")
var formidable = require('formidable')
var fs = require('fs')
var path = require('path')

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())


app.get('/', function(req, res) {
  res.send("Hello World")
})

app.get('/marker', cors(), function(req, res) {
  var res_list = []
  var sql = 'SELECT * FROM markers'
  conn.query(sql, function(err, results) {
    if(err) {
      res.send({res: 'ERROR'})
      throw err
    } else {
      for(r in results) {
        var rs = results[r]
        var tmp_obj = {
          m_id: rs.m_id,
          img_url: rs.img_url,
          latitude: rs.latitude,
          longitude: rs.longitude,
          comment: rs.comment,
          type: rs.type,
          marked_time: rs.marked_time
        }
        res_list.push(tmp_obj)
      }
      res.send(res_list)
    }
  })

})

app.post('/marker', cors(), function(req, res) {

  var form = new formidable.IncomingForm()

  form.parse(req, function(err, fields, files) {
    var s3 = new aws.S3()

    var latitude = fields.latitude
    var longitude = fields.longitude
    var comment = fields.comment
    var type = fields.type


    var sql = 'INSERT INTO markers(latitude, longitude, comment, type) VALUE(?, ?, ?, ?)'
    var params = [latitude, longitude, comment, type]
    conn.query(sql, params, function(err, results) {
      if(err) {
        res.send({res: 'ERROR'})
        throw err
      }
      else if(results.affectedRows >= 1) {

        var ext = path.extname(files.img.name)
        var fullname = 'img/marker/' + results.insertId + ext
        var params = {
          Bucket: 'lulrudev',
          Key: fullname,
          ACL: 'public-read',
          Body: fs.createReadStream(files.img.path)
        }

        s3.upload(params, function(err, data) {
          if(err) {
            throw err
            res.send({
              res: "ERROR",
              details: "failed to upload img to s3 storage.",
              img_url: 'ERROR'
            })
          } else {
            const m_id = results.insertId
            const url = data.Location
            var sql = 'UPDATE markers SET img_url=? WHERE m_id=?'
            var params = [url, m_id]
            conn.query(sql, params, function(err, results) {
              if (err) {
                throw err
                res.send({
                  res: "ERROR",
                  details: "failed to update database [image url]"
                })
              } else {
                res.send({
                  m_id: m_id,
                  res: "SUCCESS",
                  img_url: url,
                  latitude: latitude,
                  longitude: longitude,
                  comment: comment,
                  type: type
                })
              }
            })
          }
        })
      } else {
        res.send({res: 'ERROR', details: 'failed to insert into database.'});
      }
    })
  })
})

app.delete('/marker/:m_id', cors(), function(req, res) {
  const m_id = req.params.m_id

  var sql = 'DELETE FROM markers WHERE m_id = ?'
  var params = [m_id]
  conn.query(sql, params, function(err, results) {
    if(err) {
      res.send({res: 'ERROR'})
      throw err
    } else if(results.affectedRows >= 1) {
      res.send({
        res: 'SUCCESS',
        m_id: m_id
      })
    } else {
      res.send({res: 'FAILED'})
    }
  })
})


/*const options = {
  ca: fs.readFileSync(__dirname + '/tls/ca_bundle.crt'),
  key: fs.readFileSync(__dirname + '/tls/private.key'),
  cert: fs.readFileSync(__dirname + '/tls/certificate.crt')
  //passphrase: '0328'
}

https.createServer(options, app).listen(process.env.PORT || 443, function() {
  console.log("listing starts.")
})*/

app.listen(process.env.PORT || 3000, function() {
  console.log("listen on port 3000.")
})
