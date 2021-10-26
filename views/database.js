const mysql = require('mysql2');
const dbConnection = mysql.createPool({
    host     : 'localhost', 
    user     : 'root', 
    password : '', 
    database : 'js_login' 
}).promise();
module.exports = dbConnection;