var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


var cateTemp = null;
var projTemp = null;
var categories_query = 'SELECT * FROM categories';
var project_query = 'SELECT DISTINCT ON ("projectStartDate","projectName") p.*, '
                  +'(SELECT count(*) FROM likes l where l."projectName" = p."projectName") as likeCount,'
                  +'(SELECT count(*) FROM follows f where f."projectName" = p."projectName") as followCount, a."pictureAddress" FROM projects p '
                  +'NATURAL JOIN attaches a '
                  +'WHERE "projectStartDate" <= cast(now() as date) '
                  +'AND "projectDeadline" > cast(now() as date) '
                  +'ORDER BY "projectStartDate", "projectName", "pictureAddress" DESC';


router.get('/', function(req, res, next) {

  pool.query(categories_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log(cateTemp);
      getAllProjects();
    } else 
      console.log("no category");
  });

  function getPicture() {
    pool.query(categories_query, (err, data) => {
      if(data != null){
        cateTemp = data.rows;
        console.log(cateTemp);
        getAllProjects();
      } else 
        console.log("no picture");
    });
  }

  function getAllProjects() {
    console.log(project_query);
    pool.query(project_query, (err, data) => {
      if(data != null){
        projTemp = data.rows;
        console.log(projTemp);
      }
      renderPage();
    });
  }

  function getLikes() {
    console.log(project_query);
    pool.query(project_query, (err, data) => {
      if(data != null){
        projTemp = data.rows;
        console.log(projTemp);
      }
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null)
      res.render('view-projects', { title: '', categories :  cateTemp, projects : projTemp});
    else 
      res.render('view-projects', { title: '', categories : null, projects : null})
  }
});



module.exports = router;
