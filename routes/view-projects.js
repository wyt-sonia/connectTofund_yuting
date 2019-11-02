var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});


var cateTemp = null;
var sql_query = 'SELECT * FROM categories';

router.get('/', function(req, res, next) {

  pool.query(sql_query, (err, data) => {
    if(data != null){
      cateTemp = data.rows;
      console.log(cateTemp);
    } else 
      console.log("no category");
    renderPage();
  });
  
  function renderPage() {
    if(cateTemp != null)
      res.render('view-projects', { title: '', categories :  cateTemp});
    else 
      res.render('view-projects', { title: '', categories: null })
  }
  
});



module.exports = router;
