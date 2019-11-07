var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

var email = null;
var infoType = null;
var info_query = null;
var infoTemp = null;

router.get('/', function(req, res, next) {
    email = req.cookies['email'];
    infoType = req.query.infoType;
    
    
    switch (infoType){
        case "like":
        info_query = "SELECT * FROM likes WHERE email = '"+ email +"'";
        break;
        case "follow":
        info_query = "SELECT * FROM follows WHERE email = '"+ email +"'";
        break;
        case "comment":
        info_query = "SELECT * FROM comments WHERE email = '"+ email +"'";
        break;
        case "donation":
        info_query = "SELECT f.*, "
        +"(SELECT COUNT(*) FROM projects p WHERE p.\"projectName\"= f.\"projectName\" "
        +"AND p.\"projectDeadline\" >= cast(now() as date)) AS projStatus "
        +"FROM funds f WHERE email = '"+ email +"' ORDER BY projStatus DESC, \"fundDateTime\" DESC ";
        break;
        case "systemMessage":
        info_query = "SELECT * FROM message WHERE email = '"+ email +"'";
        break;
    }
    console.log(info_query);
    
    pool.query(info_query, (err, data) => {
        if(data != null){
            infoTemp = data.rows;
            console.log(infoTemp);
        } else 
        console.log("no category");
        renderPage();
    });
    
    function renderPage() {
        if(infoTemp != null){
            res.render('myInfo', { title: '', infoTemp: infoTemp, infoType: infoType });
        }
        else 
        res.render('myInfo', { title: '', infoTemp: null, infoType: null })
    }
});

router.post('/', function(req, res, next) {
    email = req.cookies['email'];
    var action_query = null ;
    var path = "";
    var refundProjName = req.body.refundProjName_form;
    var donateDate = req.body.donateDate_form;
    var act = req.body.act;

    switch(act){
        case "refund":
        action_query = "DELETE FROM funds WHERE email = '" + email 
        + "' AND \"projectName\" = '" + refundProjName + "' AND \"fundDateTime\" = '" + donateDate + "'";
        path = "/myInfo?infoType=donation";
        break;

    }
    console.log(action_query);
    
    pool.query(action_query, (err, data) => {
        if(data != null){
            res.redirect(path);
        } else 
        console.log(err);
    });
});

module.exports = router;