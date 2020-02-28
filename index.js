require('dotenv').config();

var express = require('express')
var bodyParser = require('body-parser')
var conn = require('./db')
var cors = require('cors')
var http = require('http')
var aws = require('aws-sdk')
var formidable = require('formidable')
var fs = require('fs')
var path = require('path')
var compression = require('compression')
var marker = require('./marker')
var conn = require('./db')

aws.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var app = express()
app.use(compression())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'));

app.set('view engine', 'ejs');

/*var corsOptions = {
  origin :'http://whereismypet.paas-ta.org'
};*/
app.get('/marker', cors(/*corsOptions*/), marker.getMarkers)
app.post('/marker', cors(/*corsOptions*/), marker.insertMarker)
app.delete('/marker/:m_id', cors(/*corsOptions*/), marker.deleteMarker)
app.get('/', function(req, res) {
  res.render('index');
})

app.listen(80, function() {
  console.log("Server Started" )
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
