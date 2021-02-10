const express = require('express');
const app = express();
const { 
    fisherYatesShuffle, 
    getGoogleBook, 
    flipPublished 
} = require('../util');
// promise.promisifyAll(tagCloud);
if (app.get('env') == 'development'){ require('dotenv').config(); }
const Book = require('../models/book');
const Tag = require('../models/tag');
const Review = require('../models/review');

module.exports = {

    async getReviewDetails(req, res, next) {
        try {
            /* find the specified book in the database */
            const currentReview = await Review.findById(req.params.reviewId).populate({path: 'book tags'});
            if(!currentReview) {
                req.session.error = "Review not found";
                return res.redirect('/');
            }
            if (!currentReview.status.active && req.user.role !== 'owner') {
                req.session.error = "The specified review has been unpublished";
                return res.redirect('/');
            }
            const googleBook = await getGoogleBook(currentReview.book._id)
        } catch (err) {

        }
    }

}