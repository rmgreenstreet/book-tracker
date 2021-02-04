const express = require('express');
const app = express();
const axios = require('axios').default;
const tagCloud = require('tag-cloud');
const promise = require('bluebird');
promise.promisifyAll(tagCloud);
if (app.get('env') == 'development'){ require('dotenv').config(); }
const Book = require('../models/book');
const Tag = require('../models/tag');
const Review = require('../models/review');
// const {google} = require('googleapis');
// const googleBooks = google.books({
//     version: 'v1',
//     auth: process.env.GOOGLE_BOOKS_API_KEY    
// });

const booksApiUrl = 'https://www.googleapis.com/books/v1/volumes/'

//Implement Fisher-Yates(-Knuth) shuffle--for tags/tag cloud
function fisherYatesShuffle (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        const swapIndex = Math.floor(Math.random() * (i + 1))
        const currentItem = arr[i]
        const itemToSwap = arr[swapIndex]
        arr[i] = itemToSwap
        arr[swapIndex] = currentItem
      }
      return arr
}


//Look up book using id submitted via Google Books API
async function getGoogleBook(bookId) {
    return await axios.get(booksApiUrl + bookId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);
}

//flip whether book is published or unpublished (active: true/false);
async function flipPublished(req, state) {
    //Find book in database, then update it with state and modified by/at information
    const updatedBook = await Book.findOneAndUpdate({_id: req.params.bookId}, {
        active: state,
        modified: {
            by: req.user.id,
            at: Date.now()
        }
    });
    const action = state === false ? 'Unpublished' : 'Published';
    req.session.success = `The Book Has Been ${action}!`;
}

module.exports = {

    async getAllBooks(req, res, next) {
        try {
            const allBooks = await Book.find({});
            return res.render('books/all-books', {title: 'All Books', allBooks: allBooks});
        } catch (err) {
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async createBook(req, res, next) {
        try {
            //Look up book using id submitted via Google Books API
            const googleBook = await getGoogleBook(req.body.bookId);

            let newBook = await Book.create({
                title: googleBook.data.volumeInfo.title,
                googleBooksId: googleBook.data.id,
                createdBy: req.user.id
            });
            res.redirect('/books/'+newBook.id);
        } catch (err) {
            console.error(err.message);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async findBook(req, res, next) {
        try {
            //Find book in database
            const currentBook = await Book.findById(req.params.bookId);
            if(!currentBook) {
                req.session.error = "Book not found";
                return res.redirect('/');
            }
            if (!currentBook.active && req.user.role !== 'owner') {
                req.session.error = "The specified book has been unpublished";
                return res.redirect('/');
            }
            const floorRating = await currentBook.calculateAverageRating();
            //Look up book using id submitted via Google Books API
            const googleBook = await getGoogleBook(currentBook.googleBooksId);

            /* get all reviews for currentBook, selecting only 'tags', and populate those tags */
            const relevantReviews = await Review.find({book: currentBook._id}, 'tags')
                .populate(
                    {
                        path:'tags'
                    }
                )
                .exec();

            /* Distill tags to title, description, id, and number of occurrences for the book that the review is about */
            const tags = []; 
            for (let review of relevantReviews) {
                for (let tag of review.tags) {
                    //Check whether an object with a 'title' attribute that matches the current tag title
                    let foundIndex = tags.findIndex(function(e) { return e.title === tag.title });
                    //If one does exist, increase the 'count' of the tag at that index's occurrence
                    if (foundIndex !== -1) {
                        tags[foundIndex].count++;
                        foundindex = -1;
                    } else {
                        /* If not, make a new object with that tag's attributes, whose 'count' attribute will be incremented 
                        if it is found again */
                        tags.push({
                            title: tag.title,
                            id: tag._id,
                            description: tag.description,
                            count: 1
                        })
                    }
                }
                
            }
            // Sort tags by 'count'
            const orderedTags = tags.sort(function(a,b) {
                return a.count - b.count;
            })
            .reverse();

            const highestCount = orderedTags[0].count;
            //Shuffle tag cloud for display
            fisherYatesShuffle(tags);

            res.render('books/book-details', {currentBook, googleBook: googleBook.data, tags, highestCount, floorRating, relevantReviews});
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async updateBook(req, res, next) {
        try {
            //Find book in database, then update it
            // const currentBook = await Book.findOneAndUpdate({id: req.params.bookId}, req.body);

            const currentBook = await Book.findById(req.params.bookId);
            currentBook.tags = req.body.tags;
            currentBook.modified = {
                by: req.user.id,
                at: Date.now()
            };
            await currentBook.save();

            //Look up book using id submitted via Google Books API
            const googleBook = await getGoogleBook(currentBook.googleBooksId);
            req.session.success = 'Book Information Updated!';
            res.redirect('/books/'+currentBook.id);
        } catch (err) {
            console.error(err.message);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async unPublishBook(req, res, next) {
        try {
            if(req.user.role === 'owner') {
                await flipPublished(req, false);
                res.redirect(`/books/${req.params.bookId}`);
            } else {
                req.session.error = 'You do not have permission to do that';
                res.redirect('back');
            }
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async rePublishBook(req, res, next) {
        try {
            if(req.user.role === 'owner') {
                await flipPublished(req, true);
                res.redirect(`/books/${req.params.bookId}`);
            } else {
                req.session.error = 'You do not have permission to do that';
                res.redirect('back');
            }
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async deleteBook(req, res, next) {
        try {
            //Find book in database and delete it 
            const removedBook = await Book.findOneAndRemove({_id: req.params.bookId});
            const removedReviews = await Review.findAndUpdate({book: req.params.bookId}, {
                status: 
                { 
                    active: false,
                    reason: 'Associated book removed'
                }
            });
            req.session.success = `The Book ${removedBook.title} has been permanently deleted, with ${removedReviews.deletedCount} associated Reviews. Review authors will be notified.`;
            res.redirect('/books');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    }

}