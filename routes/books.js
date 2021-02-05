const express = require('express');
const router = express.Router({mergeParams:true});
const { 
    getAllBooks,
    getSearchResults,
    createBook,
    findBook,
    updateBook,
    unPublishBook,
    rePublishBook,
} = require('../controllers/books');
const { 
  asyncErrorHandler, 
  isLoggedIn,
  isValidPassword,
  changePassword,
  searchAndFilterPosts
} = require('../middleware');

const siteTitle = " - Book Tracker | What Should I Read Next?"

/* GET All books page. */
router.get('/', isLoggedIn, searchAndFilterPosts, getSearchResults);

/* POST new book */
router.post('/', /*isLoggedIn,*/ createBook);

/* GET books-read page. */
router.get('/read', searchAndFilterPosts, getSearchResults);

/* GET browse-books page. */
router.get('/recommendations', function(req, res, next) {
  res.render('books/recommended-books', { title: 'Recommended Books' + siteTitle });
});

/* GET specific book details */
router.get('/:bookId', findBook);

/* PUT unpublish a book */
router.put('/:bookId/unpublish', /*isLoggedIn,*/ unPublishBook);

/* PUT re-publish a book */
router.put('/:bookId/publish', /*isLoggedIn,*/ rePublishBook);

/* DELETE specific book details */
// router.delete('/:bookId', function (req, res, next) {
//     res.redirect('/');
// });
//Erring on the side of "don't actually delete"


module.exports = router;
