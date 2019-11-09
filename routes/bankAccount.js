var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

var email = null;
var bankAccountTemp = null;
router.get('/', function(req, res, next) {
  email = req.cookies['email'];
  
  var user_query = 'SELECT * FROM binds WHERE email = \''+ email+'\'';
  console.log(user_query);
  
  pool.query(user_query, (err, data) => {
    if(data != null){
      bankAccountTemp = data.rows;
      console.log(bankAccountTemp);
    } else 
    console.log("no category");
    renderPage();
  });
  
  function renderPage() {
    if(bankAccountTemp != null){
      res.render('bankAccount', { title: '', bankAccounts: bankAccountTemp });
    }
    else 
    res.render('bankAccount', { title: '', bankAccounts: null })
  }
});

router.post('/', function(req, res, next) {
  email = req.cookies['email'];
  var act=req.body.act;
  var bankAccountNumber = req.body.bankAccountNumber;
  var bankAccountName = req.body.bankAccountName;
  var originalAcc = req.body.originalAcc;
  var count_query = 'SELECT COUNT(*) AS accCount FROM binds WHERE email = \''+ email+'\'';
  var query = "";
  switch(act) {
    case "updateAcc":
    query= "UPDATE binds SET bankAccountNo = '" 
    + bankAccountNumber+ "', bankAccountName = '" 
    + bankAccountName+"' WHERE email = '" + email + "' AND bankAccountNo = '" + originalAcc + "'";
    break;
    
    case "deleteAcc":
    query="DELETE FROM binds WHERE bankAccountNo = '" + bankAccountNumber + "' AND email = '" + email + "'";
    break;
    
    case "addNewAcc":
    query="INSERT INTO binds VALUES ('" + bankAccountNumber + "','" + bankAccountName + "', '" + email + "')";
    break;
  }
  
  if(act != "deleteAcc"){
    action();
  } else {
    checkAccCount();
  }
  
  function action() {
    pool.query(query, (err, data) => {
      if (data != null){
        console.log(query);
        res.redirect('/bankAccount');
      } else{
        console.log(err);
      }
    }); 
  }
  function checkAccCount(){
    pool.query(count_query, (err, data) => {
      var result = data.rows[0];
      console.log(result);
      if (data != null && parseInt(result.acccount) > 1){
        action();
      } else{
        res.redirect('/bankAccount?error=bankAccCount');
      }
    }); 
  }
  
});

module.exports = router;
