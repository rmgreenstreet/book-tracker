var express = require('express');
var router = express.Router();

const siteTitle = " - Book Tracker | What Should I Read Next?"

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' + siteTitle });
});

/* GET books-read page. */
router.get('/books-read', function(req, res, next) {
  res.render('books/books-read', { title: 'Books I\'ve Read' + siteTitle });
});

/* GET browse-books page. */
router.get('/browse-books', function(req, res, next) {
  res.render('books/browse-books', { title: 'Browse Books' + siteTitle });
});

module.exports = router;
