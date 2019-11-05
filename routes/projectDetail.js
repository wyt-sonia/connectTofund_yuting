var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

var email = null;
var projectName = null;
var projTemp = null;
var attachesTemp = null;
var myFollowTemp = null;
var myLike_query = null;
var myFollow_query = null;
var categories_query = 'SELECT * FROM categories';
var sortTerm = null;
var cateTerm = null;

/* GET users listing. */
router.get('/', function(req, res, next) {
    email = req.cookies['email'];
    projectName = req.query.proj;
    var proj_query = "";
    var attaches_query = "";
    if(projectName != null) {
        proj_query = "SELECT p.*, u.*, c.*, "
        +'(SELECT COALESCE(SUM(amount), 0) FROM funds fu WHERE fu."projectName" = p."projectName") AS donateAmount, '
        +'(SELECT p.\"projectTotalFundNeeded\" - COALESCE(SUM(amount), 0) FROM funds fu WHERE fu."projectName" = p."projectName") AS togo '
        +"FROM projects p "
        +"NATURAL JOIN countries c "
        +"NATURAL JOIN users u WHERE p.\"projectName\" = \'" + projectName + "\'";
        attaches_query = "SELECT * FROM attaches WHERE \"projectName\" = \'" + projectName + "\'";
        pool.query(proj_query, (err, data) => {
            if(data != null){
                projTemp = data.rows[0];
                console.log(projTemp);
                getAllAttches();
            } else 
            console.log(err);
        });
    } 
    function getAllAttches() {
        pool.query(attaches_query, (err, data) => {
            if(data != null){
                attachesTemp = data.rows;
                console.log(attachesTemp);
            } else 
            console.log(err);
        });
    }
    if(projTemp != null && attachesTemp != null)
    res.render('projectDetail', { title: 'projectDetail', project: projTemp, attaches: attachesTemp});
    else
    res.render('projectDetail', { title: 'projectDetail', project: null, attaches: null});
});



module.exports = router;
