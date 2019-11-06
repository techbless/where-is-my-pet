var express = require('express')
var bodyParser = require('body-parser')
var conn = require('./db')
var cors = require('cors')

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())



/*app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  next()
})*/

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
  var post = req.body

  var img_url = post.img_url
  var latitude = post.latitude
  var longitude = post.longitude
  var comment = post.comment
  var type = post.type

  var sql = 'INSERT INTO markers(img_url, latitude, longitude, comment, type) VALUE(?, ?, ?, ?, ?)'
  var params = [img_url, latitude, longitude, comment, type]
  conn.query(sql, params, function(err, results) {
    if(err) {
      res.send({res: 'ERROR'})
      throw err
    }
    else if(results.affectedRows >= 1) {
      res.send({
        res: 'SUCCESS',
        img_url: img_url,
        latitude: latitude,
        longitude: longitude,
        comment: comment,
        type: type
      });
    } else {
      res.send({res: 'FAILED'});
    }
  })
})

app.listen(process.env.PORT || 3000, function() {
  console.log("listen on port 3000.")
})
