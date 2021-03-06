var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});


var cateTemp = null;
var countryTemp = null;
var categories_query = 'SELECT * FROM categories';
var countries_query = 'SELECT * FROM countries';

router.get('/', function(req, res, next) {
  
  pool.query(categories_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log(data);
      getCountries();
    } else {
      console.log("no category");
    }
  });
  
  function getCountries() {
    pool.query(countries_query, (err, data) => {
      if(data != null && cateTemp != null) {
        countryTemp = data.rows;
        res.cookie("countries", countryTemp);
      }
      else 
      console.log('no country');
      
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null && countryTemp != null)
    res.render('index', { title: '', countries: countryTemp, categories :  cateTemp});
    else 
    res.render('index', { title: '', countries: null, categories: null })
  }
  
});

router.post('/', function(req, res, next) {
  var action = req.body.act;
  if(action == "login") {
    var userEmail = req.body.userEmail;
    var password = req.body.pw;
    var login_query = '';
    
    login_query = "SELECT COUNT(*) as result from users where email = '" + userEmail + "' and password = '" + password +"'";
    
    console.log(login_query);
    
    pool.query(login_query, (err, data) => {
      if(data != null && data.rows[0].result == 1) {
        res.cookie("email", userEmail);
        res.redirect('/home');
        console.log("Login succeed.");
      } else {
        res.redirect('/?error=loginError');
        console.log("Login failed.");
      }
    });
  } else {
    var email = req.body.email;
    var username = req.body.username;
    var phoneNumber = req.body.phoneNumber;
    var password = req.body.pw;
    var location = req.body.location;
    
    var bankAccountNo = req.body.bankAccountNo;
    var bankAccountName = req.body.bankAccountName;
    var insertTemp;
    var accTemp = null;
    console.log(req.body);
    
    var insert_query = "INSERT INTO users VALUES ('" + username + "','" + email + "','" + password +"','"
    + location + "','" + phoneNumber+"')";
    
    var insert_acc_query = "INSERT INTO binds VALUES ('" + bankAccountNo + "','" + bankAccountName + "', '" + email + "')";
    
    pool.query(insert_query, (err, data) => {
      if (data != null){
        insertTemp = data.rows;
        console.log("I'm here");
        console.log(data);
        console.log(insert_query);
        insertAcc();
      } else{
        if(String(err.message).includes("username")){
          res.redirect('/?error=duplicateUsername');
        }
        else{
          console.log(err.message);
          res.redirect('/?error=signupError');
        }
      }
    });
    
    function insertAcc() {
      pool.query(insert_acc_query, (err, data) => {
        if(data != null && insertTemp != null) 
        accTemp = data.rows;
        else 
        console.log(err);
        
        res.cookie("email", email);
        res.redirect('/home')
      });
    }
    
  }
});



module.exports = router;
