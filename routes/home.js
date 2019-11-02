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
      getCategories();
    } else 
      console.log("no category");
  });

  function getCategories() {
    pool.query(countries_query, (err, data) => {
      if(data != null && cateTemp != null) 
        countryTemp = data.rows;
      else 
        console.log('no country');
      
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null && countryTemp != null)
      res.render('home', { title: '', countries: countryTemp, categories :  cateTemp});
    else 
      res.render('home', { title: '', countries: null, categories: null })
  }
  
});



module.exports = router;
