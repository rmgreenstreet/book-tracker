const express = require('express');
const app = express();
const { 
    fisherYatesShuffle, 
    getGoogleBook, 
    flipPublished, 
    getPopularTags
} = require('../util');
// promise.promisifyAll(tagCloud);
if (app.get('env') == 'development'){ require('dotenv').config(); }
const Book = require('../models/book');
const Tag = require('../models/tag');
const Review = require('../models/review');

module.exports = {

    async getReviewDetails(req, res, next) {
        try {
            /* find the specified review in the database */
            const currentReview = await Review.findById(req.params.reviewId).populate({path: 'book tags author'});
            if(!currentReview) {
                req.session.error = "Review not found";
                return res.redirect('/');
            }
            //If the review has been unpublished AND the logged-in user is not an owner, redirect back to the home page
            if (!currentReview.status.active && req.user.role !== 'owner') {
                req.session.error = "The specified review has been unpublished";
                return res.redirect('/');
            }
            //If the review has been marked private AND the logged-in user is not an owner, redirect back to the home page
            if (!currentReview.public && req.user.role !== 'owner') {
                req.session.error = "The specified review has been marked \"Private\" by the user";
                return res.redirect('/');
            }
            //Find tags other users have applied to this book, filtered to the (up to) seven highest occurences
            const {tags} = await getPopularTags(currentReview.book._id);
            let popularTags = tags.filter(function(tag) {
                return tag.count > 1;
            });
            const googleBook = await getGoogleBook(currentReview.book.googleBooksId);
            res.render('reviews/review-details', {currentReview, googleBook: googleBook.data, popularTags});
        } catch (err) {
            console.error(err.message);
            req.session.error = err.message;
            if(err.isAxiosError) {
                if(err.response.status === 503) {
                    req.session.error = 'The Google Books Service is experiencing issues. Please try again in a moment.'
                }
            }
            res.redirect('back');
        }
    }

}