var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


var cateTemp = null;
var countryTemp = null;
var sql_query = 'SELECT * FROM categories';
var countries_query = 'SELECT * FROM countries';

router.get('/', function(req, res, next) {

  pool.query(sql_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log("home page: "+cateTemp);
    } else 
      console.log("no category");
    renderPage();
  });
  
  function renderPage() {
    if(cateTemp != null)
      res.render('home', { title: '', categories :  cateTemp});
    else 
      res.render('home', { title: '', categories: null })
  }
  
});



module.exports = router;
