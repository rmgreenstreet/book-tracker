var express = require('express');
var router = express.Router();

const siteTitle = " - Meenen Transmission | Emporia, KS Mechanic | 800-903-8855"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET recipes page. */
router.get('/recipes', function(req, res, next) {
  res.render('recipes', { title: 'Recipes' });
});

/* GET ingredients page. */
router.get('/ingredients', function(req, res, next) {
  res.render('ingredients', { title: 'Ingredients' });
});

/* GET plans page. */
router.get('/plans', function(req, res, next) {
  res.render('plans', { title: 'Meal Plans' });
});

/* GET shopping-list page. */
router.get('/shopping-list', function(req, res, next) {
  res.render('shopping-list', { title: 'Shopping List' });
});

module.exports = router;
