var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var navbarRouter = require('./routes/navbar');
var aboutRouter = require('./routes/about');
var homeRouter = require('./routes/home');
var viewprojectsRouter = require('./routes/view-projects');
var projectDetailRouter = require('./routes/projectDetail');
var createProjectRouter = require('./routes/createProject');
var viewCreatedProjectsRouter = require('./routes/viewCreatedProjects');
var profileRouter = require('./routes/profile');
var bankAccountRouter = require('./routes/bankAccount');
var myInfoRouter = require('./routes/myInfo');
var modifyProjectRouter = require('./routes/modifyProject');
var myMessageRouter= require('./routes/myMessage');


var app = express();
app.listen(3200);

var storage = multer.diskStorage({
  
  destination: function(req, file, cb) {
    cb(null, './public/images')
  },
  
  filename: function(req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null, file.fieldname + '-' + Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
});
var upload = multer({
  storage: storage
});

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.post('/upload', upload.any(), function(req, res, next){
  console.log(req.files);
  res.append("Access-Control-Allow-Origin","*");
  var email = req.body.email;
  var projectName = req.body.projectName;
  var projectDescription = req.body.projectDescription;
  var projectTotalFundNeeded = req.body.projectTotalFundNeeded;
  var projectStartDate = req.body.projectStartDate;
  var projectDeadline = req.body.projectDeadline;
  var category = req.body.category;
  var countryCode = req.body.countryCode;
  
  var imgs = "";
  for(var i = 0; i< req.files.length; i++) {
    if(i < req.files.length - 1 )
    imgs += "('" + req.files[i].filename + "', '" + projectName + "'), ";
    else
    imgs += "('" + req.files[i].filename + "', '" + projectName + "')";
  }
  var date_now =  new Date();
  var y = date_now.getFullYear();
  var m = date_now.getMonth() + 1;
  var d = date_now.getDate();
  console.log("today: "+date_now);
  
  var project_query = "INSERT INTO projects VALUES ('" + projectTotalFundNeeded + "','" + projectName +"','"
  + countryCode + "','" + projectDescription+"','" + projectDeadline + "','" + category + "','" + projectStartDate + "','" + email + "')";
  
  
  var attaches_query = "INSERT INTO attaches VALUES " + imgs;
  console.log(req.files.length + " : " + attaches_query);
  
  pool.query(project_query, (err, data) => {
    if(data != null) {
      projectTemp = data.rows;
      insertAttach();
    }
    else  {
      console.log(err);
      res.redirect('/createProject?error=createProjectError');
    }
  });
  
  function insertAttach() {
    pool.query(attaches_query, (err, data) => {
      if(data != null && projectTemp != null) {
        attachTemp = data.rows;
        res.redirect('/projectDetail?proj=' + projectName);
      }
      else {
        console.log(err);
      }
    });
  }
});

app.post('/modify', upload.any(), function(req, res, next){
  console.log(req.files);
  res.append("Access-Control-Allow-Origin","*");
  var email = req.body.email;
  var projectName = req.body.projectName;
  var originalName = req.body.originalName;
  var projectDescription = req.body.projectDescription;
  var projectTotalFundNeeded = req.body.projectTotalFundNeeded;
  var projectStartDate = req.body.projectStartDate;
  var projectDeadline = req.body.projectDeadline;
  var category = req.body.category;
  var countryCode = req.body.countryCode;
  var originalImgs = req.body.originalImgs;
  var originalImgsArr = originalImgs.split(",");
  var reupload = req.body.reupload;
  
  var imgs = "";
  for(var i = 0; i< req.files.length; i++) {
    if(i < req.files.length - 1 )
    imgs += "('" + req.files[i].filename + "', '" + projectName + "'), ";
    else
    imgs += "('" + req.files[i].filename + "', '" + projectName + "')";
  }
  
  var attaches_query = "INSERT INTO attaches VALUES " + imgs;
  console.log(req.files.length + " : " + attaches_query);
  
  var attaches_remove_query = "DELETE FROM attaches WHERE \"projectName\"='" + projectName +"'";
  
  var project_query = "UPDATE projects SET \"projectTotalFundNeeded\"='" + projectTotalFundNeeded + "', \"projectName\" = '" + projectName +"', \"countryCode\" = '"
  + countryCode + "', \"projectDescription\" = '" + projectDescription+"',\"projectDeadline\"='" + projectDeadline + "', \"categoryName\"='" + category + "', \"projectStartDate\" = '" + projectStartDate  + "' " 
  +"WHERE \"projectName\"='" + originalName +"'";
  
  pool.query(project_query, (err, data) => {
    if(data.rowCount == 1) {
      if(reupload == "true"){
        removeAttch();
      } else {
        console.log(data);
        res.redirect('/projectDetail?proj=' + projectName);
      }
    }
    else  {
      console.log(err);
      res.redirect('/modifyProject?proj=' + originalName);
    }
  });
  
  function removeAttch() {
    pool.query(attaches_remove_query, (err, data) => {
      if(data != null) {
        console.log(data);
        insertAttach();
      }
      else  {
        console.log(err);
        res.redirect('/modifyProject?proj=' + projectName);
      }
    });
  }
  
  function insertAttach() {
    console.log(originalImgsArr);
    pool.query(attaches_query, (err, data) => {
      if(data != null) {
        removeFromServer(0);
      }
      else {
        console.log(err);
      }
    });
  }
  
  function removeFromServer(index){

    function deleteFiles(files, callback){
      var i = files.length;
      files.forEach(function(filepath){
        fs.unlink(filepath, function(err) {
          i--;
          if (err != null && err.errno != -2) {
            callback(err);
            return;
          } else if (i <= 0) {
            callback(null);
          }
        });
      });
    }
    
    deleteFiles(originalImgsArr, function(err) {
      if (err != null && err.errno != -2) {
        console.log(err);
      } else {
        res.redirect('/projectDetail?proj=' + projectName);
        console.log('all files removed');
      }
    });
  }
});

app.post('/delete', upload.any(), function(req, res, next) {
  var projectName = req.body.projectName;
  var delete_query = "DELETE FROM projects WHERE \"projectName\"='" + projectName +"'";
  var imgsArr = req.body.images.split(",");

  pool.query(delete_query, (err, data) => {
    if(data.rowCount == 1) {
      removeFromServer();
    }
    else  {
      console.log(err);
      res.redirect('/modifyProject?proj=' + projectName);
    }
  });

  function removeFromServer(index){

    function deleteFiles(files, callback){
      var i = files.length;
      files.forEach(function(filepath){
        fs.unlink(filepath, function(err) {
          i--;
          if (err != null && err.errno != -2) {
            callback(err);
            return;
          } else if (i <= 0) {
            callback(null);
          }
        });
      });
    }
    
    deleteFiles(imgsArr, function(err) {
      if (err != null && err.errno != -2) {
        console.log(err);
      } else {
        res.redirect('/viewCreatedProjects');
        console.log('all files removed');
      }
    });
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/navbar', navbarRouter);
app.use('/about', aboutRouter);
app.use('/home', homeRouter);
app.use('/view-projects', viewprojectsRouter);
app.use('/projectDetail', projectDetailRouter);
app.use('/createProject', createProjectRouter);
app.use('/viewCreatedProjects', viewCreatedProjectsRouter);
app.use('/profile', profileRouter);
app.use('/bankAccount', bankAccountRouter);
app.use('/myInfo', myInfoRouter);
app.use('/modifyProject', modifyProjectRouter);
app.use('/myMessage', myMessageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
