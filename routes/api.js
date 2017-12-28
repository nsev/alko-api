var express = require('express');
var router = express.Router();
var dao = require('../alko/alko.dao');

/* GET users listing. */
router.get('/', function(req, res, next) {
  dao.getCatalog();
  res.send('respond with a resource');
});

module.exports = router;
