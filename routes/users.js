var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', { title: 'users' });
});

module.exports = router;
