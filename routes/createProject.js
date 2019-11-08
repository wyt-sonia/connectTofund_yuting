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
var sql_query = 'SELECT * FROM categories';
var countries_query = 'SELECT * FROM countries';

var projectTemp = null;

router.get('/', function(req, res, next) {
    var email = req.cookies['email'];
    pool.query(sql_query, (err, data) => {
        if(data != null){
            cateTemp = data.rows;
            console.log(cateTemp);
            getCountry();
        } else 
        console.log("no category");
    });
    
    function getCountry() {
        pool.query(countries_query, (err, data) => {
            if(data != null && cateTemp != null){
                countryTemp = data.rows;
                console.log("country selected: "+countryTemp);
                //create();
            }else 
            console.log('no country');
            renderPage();
            
        });
    }
    
    function renderPage() {
        if(cateTemp != null && countryTemp != null)
        res.render('createProject', { title: '', countries: countryTemp, categories :  cateTemp, email : email});
        else 
        res.render('createProject', { title: '', countries: null, categories: null, email: null })
    }
    
});

module.exports = router;
