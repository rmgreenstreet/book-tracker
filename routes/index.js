const express = require('express');
const router = express.Router({mergeParams:true});
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({storage});
const { 
  getRegister,
  getLogin,
  postRegister, 
  postLogin, 
  getLogout, 
  landingPage,
  getProfile,
  updateProfile,
  getForgotPw,
  putForgotPw,
  getReset,
  putReset
} = require('../controllers');
const { 
  asyncErrorHandler, 
  isLoggedIn,
  isValidPassword,
  changePassword
} = require('../middleware');

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

/* GET create user page  */
router.get('/register', getRegister);

/* POST create user page  */
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));

/* GET login page  */
router.get('/login', getLogin);

/* POST LOGIN page  */
router.post('/login', asyncErrorHandler(postLogin));

/* GET logout  */
router.get('/logout', asyncErrorHandler(getLogout));

/*GET profile page */
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));


module.exports = router;
