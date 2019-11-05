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
var commentsTemp = null;

/* GET users listing. */
router.get('/', function(req, res, next) {
    email = req.cookies['email'];
    projectName = req.query.proj;
    var proj_query = "";
    var attaches_query = "";
    var myLike = null;
    var myFollow = null;
    var followCount = null;
    var likeCount = null;
    var myDonate = null;
    var update_query = "";
    var comment_query = "";
    if(projectName != null) {
        proj_query = 'WITH likeTemp AS ( SELECT * FROM likes WHERE \"projectName\" = \''+ projectName +'\'), '
        +'followTemp AS ( SELECT * FROM follows WHERE "projectName" =  \''+ projectName +'\') '
        +' SELECT p.*, u.*, c.*, '
        +'(SELECT COALESCE(SUM(amount), 0) FROM funds fu WHERE fu."projectName" = p."projectName") AS donateAmount, '
        +'(SELECT COUNT(*) FROM likeTemp) AS likeCount,'
        +'(SELECT SUM(mfu.amount) FROM funds mfu NATURAL JOIN users myu WHERE myu.email = \''+ email+'\' AND \"projectName\"=\''+ projectName +'\') AS myDonate, '
        +'(SELECT COUNT(*) FROM followTemp) AS followCount,'
        +'(SELECT COUNT(*) FROM followTemp myf WHERE myf.\"email\" =\'' + email + '\') AS myFollow, '
        +'(SELECT COUNT(*) FROM likeTemp myl WHERE myl.\"email\" =\'' + email + '\') AS myLike, '
        +'(SELECT p.\"projectTotalFundNeeded\" - COALESCE(SUM(amount), 0) FROM funds fu WHERE fu."projectName" = p."projectName") AS togo '
        +"FROM projects p "
        +"NATURAL JOIN countries c "
        +"NATURAL JOIN users u WHERE p.\"projectName\" = \'" + projectName + "\'";
        attaches_query = "SELECT * FROM attaches WHERE \"projectName\" = \'" + projectName + "\'";
        comment_query = "SELECT * FROM comments NATURAL JOIN users "
        +"WHERE \"projectName\" = \'" + projectName + "\' "
        +"ORDER BY \"commentDateTime\" DESC";
        pool.query(proj_query, (err, data) => {
            if(data != null){
                projTemp = data.rows[0];
                myFollow = projTemp.myfollow;
                myLike = projTemp.mylike;
                followCount = projTemp.followcount;
                likeCount = projTemp.likecount;
                myDonate = projTemp.mydonate;
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
                getAllComments();
            } else 
            console.log(err);
        });
    }
    function getAllComments() {
        pool.query(comment_query, (err, data) => {
            if(data != null){
                commentsTemp = data.rows;
                console.log(commentsTemp);
                renderPage();
            } else 
            console.log(err);
        });
    }
    function renderPage() {
        if (projTemp != null && attachesTemp != null){
            console.log(myFollow + " : "+ typeof(myFollow));
            res.render('projectDetail', { title: 'projectDetail', project: projTemp, commentsTemp: commentsTemp, attaches: attachesTemp, email: email, 
            myLike: myLike, myFollow: myFollow, likeCount: likeCount, followCount: followCount, myDonate: myDonate});
        }
        else
        res.render('projectDetail', { title: 'projectDetail', project: null, commentsTemp: null,attaches: null, email: null, 
        myFollow: null, myLike: null, likeCount: null, followCount: null, myDonate: myDonate});
    }
});

router.post('/', function(req, res, next){
    var action = req.body.act;
    var projName = req.body.projName;
    var email = req.cookies['email'];
    var act_query = null;
    var _date = new Date();
    var newCommentContent = req.body.newCommentContent;
    var dateStr = _date.getFullYear() + "-" + (_date.getMonth()+1) + "-" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes() + ":" +_date.getSeconds();
    
    //console.log(dateStr);
    
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
        case "newComment":
        act_query = "INSERT INTO comments VALUES ('" + email + "','" + projName +"', '" + dateStr + "','" +newCommentContent+ "')";
        break;
    }
    
    pool.query(act_query, (err, data) => {
        console.log(act_query);
        if (err) 
        console.log('SQL Error: ' + err);
        else{
            res.redirect("projectDetail?proj=" + projName);
        }
    });
});



module.exports = router;
