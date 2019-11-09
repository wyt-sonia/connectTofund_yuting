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
    var msg_query = 'SELECT *, '
    + '(SELECT COUNT(*) FROM projects WHERE \"projectName\"= m.\"projectName\") AS projectExist '
    +'FROM messages m WHERE m.email = \''+ email +'\' ORDER BY \"messageDateTime\" DESC';   
    
    pool.query(msg_query, (err, data) => {
        if(data != null){
            msgTemp = data.rows;
            console.log(msgTemp);
        } else
        console.log(err); 
        renderPage();
    });
    
    function renderPage() {
        if(msgTemp != null){
            res.render('myMessage', { title: '', msgTemp : msgTemp, channel : channel });
        }
        else 
        res.render('myMessage', { title: '', msgTemp : null, channel : null })
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