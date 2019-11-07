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
var sortTerm = null;
var cateTerm = null;

var project_query = 'SELECT DISTINCT ON ("projectStartDate","projectName") p.*, '
+'(SELECT "countryName" FROM countries c WHERE c."countryCode" = p."countryCode") AS location, '
+'(SELECT COUNT(*) FROM likes l WHERE l."projectName" = p."projectName") AS likeCount, '
+'(SELECT COALESCE(SUM(amount), 0) FROM funds fu WHERE fu."projectName" = p."projectName") AS donateAmount, '
+'(SELECT COUNT(*) FROM follows f WHERE f."projectName" = p."projectName") AS followCount, a."pictureAddress" FROM projects p '
+'NATURAL JOIN attaches a '
+'WHERE "projectStartDate" <= cast(now() as date) '
+'AND "projectDeadline" >= cast(now() as date) '
+'ORDER BY "projectStartDate", "projectName", "pictureAddress" DESC';

router.get('/', function(req, res, next) {
  
  email = req.cookies['email'];
  myLike_query =  "SELECT \"projectName\" FROM likes WHERE email = '" + email + "'";
  myFollow_query =  "SELECT \"projectName\" FROM follows WHERE email = '" + email + "'";
  
  cateTerm = req.query.cate;
  sortTerm = req.query.sortTerm;
  
  pool.query(categories_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      //console.log(cateTemp);
      getAllProjects();
    } else 
    console.log("no category");
  });
  
  function getAllProjects() {
    pool.query(project_query, (err, data) => {
      console.log(err);
      if(data != null){
        projTemp = data.rows;
        //console.log(projTemp);
        
        if(sortTerm != null) {
          switch(sortTerm) {
            case 'start':
            projTemp.sort((a,b) => 
            (a.projectStartDate > b.projectStartDate) ? 1 : ((b.projectStartDate > a.projectStartDate) ? -1 : 0));
            break;
            case 'deadline':
            projTemp.sort((a,b) => 
            (a.projectDeadline > b.projectDeadline) ? 1 : ((b.projectDeadline > a.projectDeadline) ? -1 : 0));
            break
            case 'follower':
            projTemp.sort((a,b) => 
            (parseInt(a.followcount) < parseInt(b.followcount)) ? 1 
            : ((parseInt(b.followcount) < parseInt(a.followcount)) ? -1 : 0));
            break;
            case 'likes':
            projTemp.sort((a,b) => 
            (parseInt(a.likecount) < parseInt(b.likecount)) ? 1 
            : ((parseInt(b.likecount) < parseInt(a.likecount)) ? -1 : 0));
            break;
            case 'amount':
            projTemp.sort((a,b) => 
            (parseFloat(a.donateamount) < parseFloat(b.donateamount)) ? 1 
            : ((parseFloat(b.donateamount) < parseFloat(a.donateamount)) ? -1 : 0));
            break; 
            case 'percentage':
            projTemp.sort((a,b) => 
            (parseFloat(a.donateamount) / parseFloat(a.projectTotalFundNeeded) < parseFloat(b.donateamount) / parseFloat(b.projectTotalFundNeeded)) ? 1
            : ((parseFloat(b.donateamount) / parseFloat(b.projectTotalFundNeeded) < parseFloat(a.donateamount)) / parseFloat(a.projectTotalFundNeeded) ? -1 : 0));
            break; 
            default:
            break;
          }
        }
        
        if(cateTerm != null && cateTerm != 'all') {
          projTemp = projTemp.filter(function(proj) {
            return proj.categoryName === cateTerm;
          });          
        }
        
      }
      //console.log(projTemp);
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
    res.render('view-projects', { title: '', categories :  cateTemp, projects : projTemp, myLikes : myLikeTemp, myFollows : myFollowTemp, countries: req.cookies['countries'] , 
    sortTerm: sortTerm, cateTerm: cateTerm});
    else 
    res.render('view-projects', { title: '', categories : null, projects : null, myLikes: null, myFollows: null, countries: null,
    sortTerm: null, cateTerm: null})
  }
});

router.post('/', function(req, res, next) {
  
  var action = req.body.act;
  var projName = req.body.projName;
  var email = req.cookies['email'];
  var act_query = null;
  var _date = new Date();
  var dateStr = _date.getFullYear() + "-" + (_date.getMonth()+1) + "-" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes() + ":" +_date.getSeconds();
  
  //console.log(dateStr);
  
  switch(action) {
    case "like":
    act_query = "INSERT INTO likes VALUES ('" + dateStr + "','" + email + "','" + projName +"')";
    break;
    case "follow":
    act_query = "INSERT INTO follows VALUES ('" + email + "','" + projName +"','" + dateStr +"')";
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
    else{
      if(action == 'like' || action == "delike") {
        getMyLike();  //redo databind
      } else {
        getMyFollows(); //redo databind
      }
    }
  });
  
  function getMyLike() {
    pool.query(myLike_query, (err, data) => {
      if(data != null){
        var temp = data.rows;
        myLikeTemp = [];
        for(var i = 0; i < temp.length; i++) {
          myLikeTemp.push(temp[i].projectName);
        }
      }
      renderPage();
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
    var path = '/view-projects';
    if(cateTerm != null)
    path += '?cate=' + cateTerm;
    if(sortTerm != null) {
      path = cateTerm != null ? path+='&sortTerm='+sortTerm : path+='?sortTerm='+sortTerm;
      console.log("path: "+path);
    } 
    res.redirect(path);
  }
});

module.exports = router;
