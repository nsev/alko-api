var express = require('express');
var router = express.Router();
var _ = require('lodash');

var dao = require('../alko/alko.dao');

router.get('/v1/products', function(req, res, next) {
  dao.getCatalog().then((data) => {
    res.set('Content-Type', 'application/json');
    res.send(data);
  });
});

router.get('/v1/products/:productId', function(req, res, next) {
  dao.getCatalog().then((data) => {
    res.set('Content-Type', 'application/json');
    console.log(req.params);
    const productId = req.params.productId;
    console.log('Finding product with id', productId);
    const product = _.find(data, { number: productId });

    console.log('Found product', product);
    res.send(product);
  });
});

module.exports = router;
