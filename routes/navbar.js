var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// Login & Sign up
router.post('/', function(req, res, next) {
  var action = req.body.act;
  if(action == "login") {
    var usernameEmail = req.body.usernameEmail;
    var password = req.body.pw;
    var login_query = '';
    
    login_query = 'SELECT count(*) as result from users where (email = \'' + usernameEmail + '\' or username = \'' 
                  + usernameEmail + '\') and password = \'' + password + '\'';
    
    console.log(login_query);
    
    pool.query(login_query, (err, data) => {
      if(data != null && data.rows[0].result == 1) {
        res.redirect('/');
        console.log("Login succeed.");
      } else {
        res.redirect('/');
        console.log("Login failed.");
      }
    });
  } else {
    var email = req.body.email;
    var username = req.body.username;
    var phoneNumber = req.body.phoneNumber;
    var password = req.body.pw;
    var location = req.body.location;
    console.log(req.body);
  
    var insert_query = "INSERT INTO users VALUES ('" + username + "','" + email + "','" + password +"','"
                        + location + "','" + phoneNumber+"')";
  
    pool.query(insert_query, (err, data) => {
      console.log(insert_query);
      res.redirect('/')
    });
  }
});

module.exports = router;
