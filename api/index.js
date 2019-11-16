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
var compression = require('compression')
var marker = require('./marker')
var conn = require('./db')

var app = express()
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())

app.get('/marker', cors(), marker.getMarkers)
app.post('/marker', cors(), marker.insertMarker)
app.delete('/marker/:m_id', cors(), marker.deleteMarker)
app.get('/', function(req, res) {
  res.send("Hello World")
})

app.listen(process.env.PORT || 3000, function() {
  console.log("listen on port 3000.")
})

setInterval(function() {
  //Delete from markers WHERE marked_time < now() - INTERVAL 3 day;
  const sql = 'DELETE FROM markers WHERE marked_time < now() - INTERVAL 3 DAY'
  conn.query(sql, function(err, results) {
    if (err) {
      throw err
    } else {
      console.log(results.affectedRows + " deleted from the table.")
    }
  })
}, 60 * 60 * 1000) // -> 1 hour.
