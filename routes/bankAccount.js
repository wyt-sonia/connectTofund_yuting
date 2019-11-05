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
      var bankAccountNumber = req.body.bankAccountNumber;
      var bankAccountName = req.body.bankAccountName;
      var insertTemp = null;
  
      var insert_acc_query = "INSERT INTO binds VALUES ('" + bankAccountNumber + "','" + bankAccountName + "', '" + email + "')";
    
      pool.query(insert_acc_query, (err, data) => {
        if (data != null){
          insertTemp = data.rows;
          console.log(insert_acc_query);
          res.redirect('/bankAccount');
        } else{
          res.redirect('/bankAccount?error=addBankAccountError');
        }
      }); 
      
  });

module.exports = router;
