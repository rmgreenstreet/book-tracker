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


async function getCurrentReview() {

}

module.exports = {

    async getReviewDetails(req, res, next) {
        try {
            /* find the specified review in the database */
            const currentReview = await Review.findById(req.params.reviewId).populate({path: 'book tags author'});
            if(!currentReview) {
                req.session.error = "Review not found";
                return res.redirect('back');
            };
            //If the review has been unpublished AND the logged-in user is not an owner or the author of the review, redirect back to the home page
            if(!currentReview.status.active && (req.user.id !== currentReview.author._id && req.user.role !== 'owner')) {
                req.session.error = "This review has been unpublished by the author";
                return res.redirect('back');
            }
            //If the review has been marked private AND the logged-in user is not an owner, redirect back to the home page
            if (!currentReview.public && req.user.role !== 'owner') {
                req.session.error = "The specified review has been marked \"Private\" by the user";
                return res.redirect('back');
            };
            //Find tags other users have applied to this book, filtered to the (up to) seven highest occurences
            const {tags} = await getPopularTags(currentReview.book._id);
            let popularTags = tags.filter(function(tag) {
                return tag.count > 1;
            }).sort(function(a,b) {
                return b.count - a.count;
            });
            popularTags = fisherYatesShuffle(popularTags);
            const highestCount = popularTags[0].count;
            const googleBook = await getGoogleBook(currentReview.book.googleBooksId);
            res.render('reviews/review-details', {currentReview, googleBook: googleBook.data, popularTags, highestCount});
        } catch (err) {
            console.error(err.message);
            req.session.error = err.message;
            if(err.isAxiosError) {
                if(err.response.status === 503) {
                    req.session.error = 'The Google Books Service is experiencing issues. Please try again in a moment.'
                };
            };
            res.redirect('back');
        };
    },
    async getReviewEdit(req, res, next) {
        // TODO: Find a way to recycle code from 'getReviewDetails' since nearly all of the same information is needed here
        try {
            /* find the specified review in the database */
            const currentReview = await Review.findById(req.params.reviewId).populate({path: 'book tags author'});
            if(!currentReview) {
                req.session.error = "Review not found";
                return res.redirect('back');
            };
            if(!currentReview.status.active && (req.user.id !== currentReview.author._id && req.user.role !== 'owner')) {
                req.session.error = "This review has been unpublished by the author";
                return res.redirect('back');
            }
            //Find tags other users have applied to this book, filtered to the (up to) seven highest occurences
            const {tags} = await getPopularTags(currentReview.book._id);
            let popularTags = tags.filter(function(tag) {
                return tag.count > 1;
            }).sort(function(a,b) {
                return b.count - a.count;
            });
            const googleBook = await getGoogleBook(currentReview.book.googleBooksId);
            res.render('reviews/review-edit', {currentReview, googleBook: googleBook.data, popularTags});

        } catch(err) {
            console.error(err.message);
            req.session.error = err.message;
            if(err.isAxiosError) {
                if(err.response.status === 503) {
                    req.session.error = 'The Google Books Service is experiencing issues. Please try again in a moment.'
                }
            }
            res.redirect('back');
        }
    },
    async putUpdateReview(req, res, next) {
        try {
            let updates = req.body.review;

            /* convert dates from string to date */
            updates.bookStartedDate = new Date(updates.bookStartedDate);
            updates.bookFinishedDate = new Date(updates.bookFinishedDate);
            
            if (updates.bookFinishedDate && updates.bookStartedDate > updates.bookFinishedDate) {
                req.session.error = '"Started" date cannot be after "Finished" date.';
                return res.redirect('back');
            }
            
            let currentReview = await Review.findOneAndUpdate({_id: req.params.reviewId}, updates);

            req.session.success = 'The Review has been updated!'
            res.redirect(`/reviews/${req.params.reviewId}`)
        } catch (err) {
            req.session.error = err.message;
            res.redirect('back');
        }
    },
    async getPublishOrUnpublishReview(req,res,next) {
        try {
            const updatedReview = await Review.findById(req.params.reviewId);
            updatedReview.status.active = !updatedReview.status.active;
            await updatedReview.save();
            req.session.success = `The review has been ${updatedReview.status.active ? '' : 'un'}published!`
            if (updatedReview.status.active) {
                return res.redirect(`/reviews/${updatedReview._id}`);
            }
            res.redirect('/');
        } catch (err) {
            console.error(err.message)
            req.session.error = 'There was a problem changing the status of the review';
            res.redirect('back');
        }
    },
    async getReviewCreate(req, res, next) {
        res.render('reviews/review-create');
    },
    async postReviewCreate(req, res, next) {

    }

}