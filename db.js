const mysql = require('mysql');

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true
});

conn.connect(function(err) {
  if (err) throw err;
  console.log("MySQL - Connected!");
});

module.exports = conn;
