var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


var cateTemp = null;
var countryTemp = null;
var userTemp = null;
var cate_query = 'SELECT * FROM categories';
var countries_query = 'SELECT * FROM countries';

router.get('/', function(req, res, next) {

  email = req.cookies['email'];

  var user_query = 'SELECT u.*, '
                  +'(SELECT "countryName" from countries where "countryCode" = u."location" ) AS countryName '
                  +'FROM users u WHERE email = \''+ email+'\'';
  console.log(user_query);

  pool.query(cate_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log("home page: "+cateTemp);
      getCountries();
    } else 
      console.log("no category");
  });

  function getCountries() {
    pool.query(countries_query, (err, data) => {
      if(data != null && cateTemp != null) {
        countryTemp = data.rows;
        getUser();
      }
      else 
        console.log('no country');
    });
  }

  function getUser(){
    pool.query(user_query, (err, data) => {
      if(data != null && cateTemp != null && countryTemp != null) {
        userTemp = data.rows;
        console.log(userTemp);
      }
      else 
        console.log(err);
      
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null)
      res.render('profile', { title: '', countries: countryTemp, categories :  cateTemp, users : userTemp});
    else 
      res.render('profile', { title: '', countries: null, categories: null, users: null })
  }
  
});

router.post('/', function(req, res, next) {
    email = req.cookies['email'];
    var username = req.body.username_edit;
    var phoneNumber = req.body.phoneNumber_edit;
    var password = req.body.pw_edit;
    var location = req.body.location_edit;
    var updateInfo_query = "UPDATE users SET username = '"+username+"' , password = '"+password+"' , location = '"+location+"' , \"phoneNumber\" = '"+phoneNumber+"' where email = '"+email+"'";
    console.log(updateInfo_query);
    pool.query(updateInfo_query, (err, data) => {
      if(data.rowCount == 1){
        res.redirect('/profile');
      } else 
        console.log("update failed");
    });
  });

module.exports = router;
