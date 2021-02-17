const express = require('express');
const router = express.Router({mergeParams:true});
const { 
  getReviewDetails,
  getReviewEdit
} = require('../controllers/reviews');
const { 
  asyncErrorHandler, 
  isLoggedIn,
  isValidPassword,
  changePassword
} = require('../middleware');

const siteTitle = " - Book Tracker | What Should I Read Next?"

/* GET All reviews page. */
router.get('/', isLoggedIn);

/* POST new review */
// router.post('/', /*isLoggedIn,*/ createReview);

/* GET specific review details */
router.get('/:reviewId', getReviewDetails);

/* GET edit review */
router.get('/:reviewId/edit', getReviewEdit);
// router.get('/:reviewId/edit', function(req,res,next) {
//   res.render('../test/tagblock.ejs');
// });

/* PUT unpublish a review */
// router.put('/:reviewId/unpublish', /*isLoggedIn,*/ unPublishreview);

/* DELETE specific review details */
router.delete('/:reviewId', function (req, res, next) {
    res.redirect('/');
});


module.exports = router;
