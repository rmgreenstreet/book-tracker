const express = require('express');
const router = express.Router({mergeParams:true});
const { 
    getAllTags,
    createTag,
    findTag,
    updateTag,
    unPublishTag,
    deleteTag
} = require('../controllers/tags');
const { 
  asyncErrorHandler, 
  isLoggedIn,
  isValidPassword,
  changePassword
} = require('../middleware');

const siteTitle = " - Book Tracker | What Should I Read Next?"

/* GET All tags page. */
router.get('/', isLoggedIn, getAllTags);

/* POST new tag */
router.post('/', /*isLoggedIn,*/ createTag);

/* GET specific tag details */
router.get('/:tagId', function (req, res, next) {
    res.render('tags/tag-details', { title: 'Edit Tag' + siteTitle });
});

/* PUT specific tag details */
router.put('/:tagId', /*isLoggedIn,*/ updateTag);

/* DELETE specific tag details */
router.delete('/:tagId', function (req, res, next) {
    res.redirect('/');
});


module.exports = router;
