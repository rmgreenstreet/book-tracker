const express = require('express');
const router = express.Router({mergeParams:true});
const { 
    getAllBooks,
    createBook,
    findBook,
    updateBook,
    unPublishBook,
    deleteBook
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
router.get('/:bookId', findBook);

/* PUT unpublish a book */
router.put('/:bookId/unpublish', /*isLoggedIn,*/ unPublishBook);

/* DELETE specific book details */
router.delete('/:bookId', function (req, res, next) {
    res.redirect('/');
});


module.exports = router;
