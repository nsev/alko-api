var express = require('express');
var router = express.Router();
var _ = require('lodash');

var dao = require('../alko/alko.dao');

const SUPPORTED_QUERY_PARAMS = ['producer', 'grape'];

router.get('/v1/products', function(req, res, next) {
  dao.getCatalog().then((data) => {
    const queryParams = req.query;
    let result;
    if(!_.isEmpty(queryParams)) {
      console.log('Filtering with query params', queryParams)
      result = [];
      Object.keys(queryParams).forEach(function(key) {
        const value = queryParams[key];
        const matchedValues = _.filter(data, { [key]: value });
        result = _.unionBy(result, matchedValues, 'number');
      });
    }
    else {
      result = data;
    }
    res.set('Content-Type', 'application/json');
    res.send(result);
  })
  .catch((err) => {
    console.error(err)
  });
});

router.get('/v1/products/:productId', function(req, res, next) {
  dao.getCatalog().then((data) => {
    res.set('Content-Type', 'application/json');
    const productId = req.params.productId;
    console.log('Finding product with id', productId);
    const product = _.find(data, { number: productId });

    if(product){
      console.log('Found product');
    }

    res.send(product);
  });
});

module.exports = router;
