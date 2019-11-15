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
var marker = require('./marker')

var app = express()
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
