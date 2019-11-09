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

router.get('/', function(req, res, next) {
  
  email = req.cookies['email'];
  var project_query = 'SELECT DISTINCT ON (projStatus, projectStartDate,projectName) p.*, '
  +'(SELECT countryName FROM countries c WHERE c.countryCode = p.countryCode) AS location, '
  +'(SELECT COUNT(*) FROM likes l WHERE l.projectName = p.projectName) AS likeCount, '
  +'(SELECT COUNT(*) FROM projects pro WHERE pro.projectName= p.projectName '
  +'AND pro.projectDeadline >= cast(now() as date)) AS projStatus, '
  +'(SELECT COALESCE(SUM(amount), 0) FROM funds fu WHERE fu.projectName = p.projectName) AS donateAmount, '
  +'(SELECT COUNT(*) FROM follows f WHERE f.projectName = p.projectName) AS followCount, a.pictureAddress FROM projects p '
  +'NATURAL JOIN attaches a '
  +'WHERE email = \'' + email + '\''
  +'ORDER BY projStatus DESC, projectStartDate, projectName, pictureAddress DESC';
  
  myLike_query =  "SELECT projectName FROM likes WHERE email = '" + email + "'";
  myFollow_query =  "SELECT projectName FROM follows WHERE email = '" + email + "'";
  
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
    res.render('viewCreatedProjects', { title: '', categories :  cateTemp, projects : projTemp, myLikes : myLikeTemp, myFollows : myFollowTemp, countries: req.cookies['countries'] , 
    sortTerm: sortTerm, cateTerm: cateTerm});
    else 
    res.render('viewCreatedProjects', { title: '', categories : null, projects : null, myLikes: null, myFollows: null, countries: null,
    sortTerm: null, cateTerm: null})
  }
});

module.exports = router;
