var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var getUserIdentification = 'SELECT count(*) from users where ';

var countries_query = 'SELECT * FROM countries';

router.get('/', function(req, res, next) {
    res.render('navbar', { title: 'Navbar' });
/*
    pool.query(countries_query, (err, data) => {
		res.render('select', { title: 'Database Connect', data: data.rows });
	});*/
});

router.post('/', function(req, res, next) {
	var email = req.body.email;
	var password = req.body.pw;
	
	sql_query += 'email = ' + email + ' and password = ' + password;
	
	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});

var getUserSignUp = 'INSERT INTO users VALUES';
router.post('/', function(req, res, next) {
	var email = req.body.email;
	var username = req.body.username;
	var phoneNumber = req.body.phoneNumber;
	var password = req.body.password;
    var location = req.body.location;

	var insert_query = getUserSignUp + "('" + username + "','" + email + "','" + password +"','"+ location + "','" + phoneNumber+"')";

	pool.query(insert_query, (err, data) => {
		res.redirect('/select')
	});
});
module.exports = router;
