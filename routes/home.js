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

  var email = req.cookies['email'];
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
      res.render('home', { title: '', categories :  cateTemp, email: email});
    else 
      res.render('home', { title: '', categories: null, email: email })
  }
  
});

router.post('/', function(req, res, next) {

  if(req.body.logOff != null && req.body.logOff == "logOff") {
    res.cookie("email", null);
    console.log(req.cookies);
    res.redirect('/');
  }
});



module.exports = router;
