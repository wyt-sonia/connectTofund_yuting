var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

router.get('/', function(req, res, next) {
  res.render('navbar', { title: 'Navbar' });
});

router.post('/', function(req, res, next) {
	var usernameEmail = req.body.usernameEmail;
  var password = req.body.pw;
  var login_query = '';

  console.log(usernameEmail + " " + password);
	
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
});

module.exports = router;
