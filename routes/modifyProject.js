var express = require('express');
var path = require('path');
var router = express.Router();


const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

var cateTemp = null;
var countryTemp = null;
var attachTemp = null;
var cate_query = 'SELECT * FROM categories';
var countries_query = 'SELECT * FROM countries';
var attaches_query = '';
var proj_query = '';

var projectTemp = null;

router.get('/', function(req, res, next) {
  email = req.cookies['email'];
  var projName = req.query.proj;
  attaches_query = 'SELECT * FROM attaches WHERE "projectName" = \'' + projName +'\'';
  proj_query = 'SELECT * FROM projects NATURAL JOIN countries NATURAL JOIN categories WHERE "projectName" = \'' + projName +'\'';
  
  pool.query(proj_query, (err, data) => {
    if(data != null){
      projectTemp = data.rows[0];
      console.log(projectTemp);
      getCate();
    } else 
    console.log(err);
  });
  
  function getCate() {
    pool.query(cate_query, (err, data) => {
      if(data != null){
        cateTemp = data.rows;
        console.log(cateTemp);
        getCountry();
      } else 
      console.log(err);
    });
  }
  
  function getCountry() {
    pool.query(countries_query, (err, data) => {
      if(data != null && cateTemp != null){
        countryTemp = data.rows;
      }else 
      console.log(err);
      getAttaches();
    });
  }
  
  function getAttaches() {
    pool.query(attaches_query, (err, data) => {
      if(data != null){
        attachTemp = data.rows;
        console.log(attachTemp);
      }else 
      console.log(err);
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null && countryTemp != null)
    res.render('modifyProject', { title: '', countries: countryTemp, categories :  cateTemp, projectTemp: projectTemp, email : email, attachTemp: attachTemp});
    else 
    res.render('modifyProject', { title: '', countries: null, categories: null, projectTemp: null, email: null, attachTemp : null})
  }
  
});

module.exports = router;
