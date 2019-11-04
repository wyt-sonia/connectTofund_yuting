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
          res.render('createProject', { title: '', countries: countryTemp, categories :  cateTemp});
        else 
          res.render('createProject', { title: '', countries: null, categories: null })
      }
    
  });

router.post('/', function(req, res, next) {
    var projectName = req.body.projectName;
    console.log("test: "+req.body.projectName);
    var projectDescription = req.body.projectDescription;
    var projectTotalFundNeeded = req.body.projectTotalFundNeeded;
    var projectStartDate = req.body.projectStartDate;
    var projectDeadline = req.body.projectDeadline;
    var category = req.body.category;
    var status = req.body.status;
    var email = req.body.email;
    var countryCode = req.body.countryCode;
    var pictureAddress = req.body.pictureAddress;

    var date_now =  new Date();
    var y = date_now.getFullYear();
    var m = date_now.getMonth() + 1;
    var d = date_now.getDate();
    var date = y + "-" + m + "-" + d;
    var projectStartDate_ = new Date(projectStartDate);
    var projectDeadline_ = new Date(projectDeadline);
    console.log("today: "+date_now);

    if(projectStartDate_ <= date_now && projectDeadline_ >= date_now){
        status = true;
    }
    else{
        status = false;
    }
    console.log("status: "+status);

    var project_query = "INSERT INTO projects VALUES ('" + projectTotalFundNeeded + "','" + status + "','" + projectName +"','"
    + countryCode + "','" + projectDescription+"','" + projectDeadline + "','" + category + "','" + projectStartDate + "','" + email + "')";
    
    var attaches_query = "INSERT INTO attaches VALUES ('" + pictureAddress + "','" + projectName + "')";
    console.log(project_query);

    pool.query(project_query, (err, data) => {
        if(data != null) {
            projectTemp = data.rows;
            insertAcc();
            //res.redirect('/createProject');
        }
        else  {
            console.log(err);
            res.redirect('/createProject?error=createProjectError');
        }
        });

    function insertAcc() {
        pool.query(attaches_query, (err, data) => {
            if(data != null && projectTemp != null) {
                  attachTemp = data.rows;
            }
            else 
                console.log('Insert account error');
              
            res.redirect('/createProject');
        });
    }

    
});

module.exports = router;
