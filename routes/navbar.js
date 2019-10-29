var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var getUserIdentification = 'SELECT count(*) from users where ';

router.get('/', function(req, res, next) {
  res.render('navbar', { title: 'Navbar' });
});

router.post('/', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.pw;
	
	sql_query += 'email = ' + email + ' and password = ' + password;
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});

router.post('/', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.pw;
	
	sql_query += 'email = ' + email + ' and password = ' + password;
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});
module.exports = router;
