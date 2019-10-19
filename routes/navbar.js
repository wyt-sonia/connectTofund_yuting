var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('navbar', { title: 'Navbar' });
});

module.exports = router;
