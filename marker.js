var conn = require('./db')
var aws = require('aws-sdk')
var formidable = require('formidable')
var fs = require('fs')
var path = require('path')

aws.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

/* GET METHOD
  - get all markers information in database.
*/

exports.getMarkers = function(req, res) {
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
          marked_time: rs.marked_time,
          f_time: rs.f_time
        }
        res_list.push(tmp_obj)
      }
      res.send(res_list)
    }
  })
}



/* POST METHOD
  - insert marker into database.
*/

function validDateTimeFormat(dt) {
  const reg = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/
  return reg.test(dt)
}
exports.insertMarker = function(req, res) {

  try {

    var form = new formidable.IncomingForm()

    form.parse(req, function(err, fields, files) {
      if(!files.img) {
        res.send({res: "ERROR", details: "no file exists"})
        return // end of function
      }
      if(!validDateTimeFormat(fields.f_time)) {
        res.send({res: "ERROR", details: "not valid date_time format"})
        return // end of function
      }

      var s3 = new aws.S3()

      var latitude = fields.latitude
      var longitude = fields.longitude
      var comment = fields.comment
      var type = fields.type
      var f_time = fields.f_time
      var auth = fields.auth

      var sql = 'INSERT INTO markers(latitude, longitude, comment, type, f_time, auth) VALUE(?, ?, ?, ?, ?, ?)'
      var params = [latitude, longitude, comment, type, f_time, auth]
      conn.query(sql, params, function(err, results) {
        if(err) {
          res.send({res: 'ERROR'})
          throw err
          return // end of function
        }
        else if(results.affectedRows >= 1) {

          var ext = path.extname(files.img.name)
          var fullname = 'img/marker/img_marker' + results.insertId + ext
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
                    type: type,
                    f_time: f_time
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
  } catch(err) {
    throw err
    res.send({res: 'ERROR', details: 'failed something. not provided details'})
  }

}

/* DELETE METHOD
  - delete marker from database.
*/
exports.deleteMarker = function(req, res) {
  const m_id = req.params.m_id
  const auth = req.query.auth
  var sql = 'DELETE FROM markers WHERE m_id = ? AND auth = ?'
  var params = [m_id, auth]
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
}
