var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

var sql_query = 'SELECT * FROM categories';

/* GET home page. */
router.get('/', function(req, res, next) {
  pool.query(sql_query, (err, data) => {
    if(data != null){
      res.render('index', { title: 'ConnectToFund', data: data.rows });
    }
    else{
      res.render('index', { title: 'ConnectToFund', data});
    }
	});
});

module.exports = router;
