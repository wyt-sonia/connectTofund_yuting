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
var proj_query = '';

var projectTemp = null;

router.get('/', function(req, res, next) {

    var projName = req.query.proj;
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
                console.log("country selected: "+countryTemp);
            }else 
                console.log(err);
            renderPage();
          
        });
      }

    function renderPage() {
        if(cateTemp != null && countryTemp != null)
          res.render('modifyProject', { title: '', countries: countryTemp, categories :  cateTemp, projectTemp: projectTemp});
        else 
          res.render('modifyProject', { title: '', countries: null, categories: null, projectTemp: null})
      }
    
  });

router.post('/', function(req, res, next) {
    email = req.cookies['email'];

    var projectName = req.body.projectName;
    var originalName = req.body.originalName;
    var projectDescription = req.body.projectDescription;
    var projectTotalFundNeeded = req.body.projectTotalFundNeeded;
    var projectStartDate = req.body.projectStartDate;
    var projectDeadline = req.body.projectDeadline;
    var category = req.body.category;
    var status = req.body.status;
    var countryCode = req.body.countryCode;

    var date_now =  new Date();
    
    console.log("today: "+date_now);
    console.log("status: "+status);

    var project_query = "UPDATE projects SET \"projectTotalFundNeeded\"='" + projectTotalFundNeeded + "', \"projectName\" = '" + projectName +"', \"countryCode\" = '"
    + countryCode + "', \"projectDescription\" = '" + projectDescription+"',\"projectDeadline\"='" + projectDeadline + "', \"categoryName\"='" + category + "', \"projectStartDate\" = '" + projectStartDate  + "' " 
    +"WHERE \"projectName\"='" + originalName +"'";
    
    //var attaches_query = "INSERT INTO attaches VALUES ('" + pictureAddress + "','" + projectName + "')";
    console.log(project_query);

    pool.query(project_query, (err, data) => {
        if(data != null) {
            res.redirect('/projectDetail?proj=' + projectName);
        }
        else  {
            console.log(err);
            res.redirect('/modifyProject?proj=' + originalName);
        }
        });
});

module.exports = router;
