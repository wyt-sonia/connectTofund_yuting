var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.get('/', function(req, res, next) {
    email = req.cookies['email'];
    var channel = req.query.channel;
    var followingMsgTemp = null;
    var myProjMsgTemp = null;
    var following_proj_msg_query = 'SELECT * FROM messages NATURAL JOIN follows WHERE email = \''+ email +'\' ORDER BY \"messageDateTime\" DESC';
    var my_proj_msg_query = 'SELECT * FROM messages NATURAL JOIN projects WHERE email = \''+ email +'\' ORDER BY \"messageDateTime\" DESC';
    
    
    pool.query(following_proj_msg_query, (err, data) => {
        if(data != null){
            followingMsgTemp = data.rows;
            console.log(followingMsgTemp);
        } else
        console.log(err); 
        getMyProjMsg();
    });
    
    function getMyProjMsg() {
        pool.query(my_proj_msg_query, (err, data) => {
            if(data != null){
                myProjMsgTemp = data.rows;
                console.log(myProjMsgTemp);
            } else 
            console.log(err); 
            renderPage();
        });
    }
    
    function renderPage() {
        if(myProjMsgTemp != null){
            res.render('myMessage', { title: '', followingMsgTemp : followingMsgTemp, myProjMsgTemp : null, channel : channel });
        }
        else 
        res.render('myMessage', { title: '', followingMsgTemp : null, myProjMsgTemp: null, channel : null })
    }
});

router.post('/', function(req, res, next) {
    email = req.cookies['email'];
    infoType = req.query.infoType;
    var projectName = req.body.projectName;
    var topic = req.body.topic;
    var dateTime = req.body.dateTime;
    var delete_msg_query = 'DELETE FROM messages WHERE \"projectName\" = \''+ projectName +'\' AND topic = \''+ topic +'\' AND \"messageDateTime\"=\''+dateTime+'\' AND email = \'' + email + '\'';
    
    console.log(delete_msg_query);
    
    pool.query(delete_msg_query, (err, data) => {
        if(data != null){
            res.redirect("/myMessage");
        } else 
        console.log(err);
    });
});

module.exports = router;