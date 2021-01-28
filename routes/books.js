const express = require('express');
const router = express.Router({mergeParams:true});
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage: storage});
const { 
    getAllBooks,
    createBook
} = require('../controllers/books');
const { 
  asyncErrorHandler, 
  isLoggedIn,
  isValidPassword,
  changePassword
} = require('../middleware');

const siteTitle = " - Book Tracker | What Should I Read Next?"

/* GET All books page. */
router.get('/', isLoggedIn, getAllBooks);

/* POST new book */
router.post('/', /*isLoggedIn,*/ createBook);

/* GET books-read page. */
router.get('/read', function(req, res, next) {
  res.render('books/books-read', { title: 'Books I\'ve Read' + siteTitle });
});

/* GET browse-books page. */
router.get('/browse', function(req, res, next) {
  res.render('books/browse-books', { title: 'Browse Books' + siteTitle });
});

/* GET specific book details */
router.get('/:bookId', function (req, res, next) {
    res.render('books/book-details', { title: 'Edit Book' + siteTitle });
});

/* PUT specific book details */
router.put('/:bookId', function (req, res, next) {
    res.render('books/book-details', { title: 'Edit Book' + siteTitle });
});

/* DELETE specific book details */
router.delete('/:bookId', function (req, res, next) {
    res.redirect('/');
});


module.exports = router;