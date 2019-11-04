var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


var email = null;

var cateTemp = null;
var projTemp = null;
var myLikeTemp = null;
var myFollowTemp = null;
var myLike_query = null;
var myFollow_query = null;
var categories_query = 'SELECT * FROM categories';
var project_query = 'SELECT DISTINCT ON ("projectStartDate","projectName") p.*, '
                  +'(SELECT count(*) FROM likes l where l."projectName" = p."projectName") as likeCount,'
                  +'(SELECT count(*) FROM follows f where f."projectName" = p."projectName") as followCount, a."pictureAddress" FROM projects p '
                  +'NATURAL JOIN attaches a '
                  +'WHERE "projectStartDate" <= cast(now() as date) '
                  +'AND "projectDeadline" >= cast(now() as date) '
                  +'ORDER BY "projectStartDate", "projectName", "pictureAddress" DESC';

router.get('/', function(req, res, next) {

  email = req.cookies['email'];
  myLike_query =  "SELECT \"projectName\" FROM likes WHERE email = '" + email + "'";
  myFollow_query =  "SELECT \"projectName\" FROM follows WHERE email = '" + email + "'";

  pool.query(categories_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log(cateTemp);
      getAllProjects();
    } else 
      console.log("no category");
  });

  function getAllProjects() {
    console.log(project_query);
    pool.query(project_query, (err, data) => {
      console.log(err);
      if(data != null){
        projTemp = data.rows;
      }
      console.log(projTemp);
      getMyLike();
    });
  }

  function getMyLike() {
    pool.query(myLike_query, (err, data) => {
      if(data != null){
        var temp = data.rows;
        myLikeTemp = [];
        for(var i = 0; i < temp.length; i++) {
          myLikeTemp.push(temp[i].projectName);
        }
      }
      getMyFollows();
    });
  }

  function getMyFollows() {
    pool.query(myFollow_query, (err, data) => {
      if(data != null){
        var temp = data.rows;
        myFollowTemp=[];
        for(var i = 0; i < temp.length; i++) {
          myFollowTemp.push(temp[i].projectName);
        }
      } 
      renderPage();
    });
  }
  
  function renderPage() {
    if(cateTemp != null)
      res.render('view-projects', { title: '', categories :  cateTemp, projects : projTemp, myLikes : myLikeTemp, myFollows : myFollowTemp});
    else 
      res.render('view-projects', { title: '', categories : null, projects : null, myLikes: null, myFollows: null})
  }
});

router.post('/', function(req, res, next) {
  var action = req.body.act;
  var projName = req.body.projName;
  var email = req.cookies['email'];
  var act_query = null;
  var _date = new Date();
  var dateStr = _date.getFullYear() + "-" + _date.getMonth() + "-" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes() + ":" +_date.getSeconds();

  console.log(dateStr);

  switch(action) {
    case "like":
        act_query = "INSERT INTO likes VALUES ('" + dateStr + "','" + email + "','" + projName +"')";
        break;
    case "follow":
        act_query = "INSERT INTO follows VALUES ('" + email + "','" + projName +"')";
        break;
    case "deLike":
        act_query = "DELETE FROM likes WHERE \"email\" = '" + email + "' and \"projectName\" = '" + projName + "'";
        break;
    case "deFollow":
        act_query = "DELETE FROM follows WHERE \"email\" = '" + email + "' and \"projectName\" = '" + projName + "'";
        break;
  }
  
  pool.query(act_query, (err, data) => {
    
    if (err) 
      console.log('SQL Error: ' + err);
    else
      res.redirect('/view-projects')
  });
});



module.exports = router;
