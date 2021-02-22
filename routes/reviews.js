const express = require('express');
const router = express.Router({mergeParams:true});
const { 
  getReviewDetails,
  getReviewEdit,
  putUpdateReview,
  getPublishOrUnpublishReview
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
//   res.render('../test/edit-form.ejs');
// });

/* PUT update a review */
router.put('/:reviewId', putUpdateReview);
// router.put('/:reviewId', function (req,res,next) {
//   console.log(req.body.review);
//   res.redirect('back');
// });

/* GET publish a review */
router.get('/:reviewId/publish', getPublishOrUnpublishReview);

/* GET unpublish a review */
router.get('/:reviewId/unpublish', getPublishOrUnpublishReview);

/* PUT unpublish a review */
// router.put('/:reviewId/unpublish', /*isLoggedIn,*/ unPublishreview);

/* DELETE specific review details */
router.delete('/:reviewId', function (req, res, next) {
    res.redirect('/');
});


module.exports = router;
