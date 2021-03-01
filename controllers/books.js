const express = require('express');
const app = express();
const { 
    fisherYatesShuffle, 
    getGoogleBook, 
    flipPublished, 
    getPopularTags,
    createMissingBook,
    getGoogleBooksResults
} = require('../util');

if (app.get('env') == 'development'){ require('dotenv').config(); }
const Book = require('../models/book');
const Tag = require('../models/tag');
const Review = require('../models/review');
// const {google} = require('googleapis');
// const googleBooks = google.books({
//     version: 'v1',
//     auth: process.env.GOOGLE_BOOKS_API_KEY    
// });

module.exports = {

    async getAllBooks(req, res, next) {
        try {

            //get any search provided by the user, if it exists
            const { dbQuery } = res.locals;
            //remove the search from the session
            delete res.locals.dbQuery;
            //get all posts, 10 per page, for the current page
            let reviews = await Review.paginate(dbQuery,{
                page: req.query.page || 1,
                limit: 10,
                sort:'-_id'
            });
            // set the current page of results
            reviews.page = Number(reviews.page);
            // console.log(reviews.docs.length+' reviews found');
            if(!reviews.docs.length && res.locals.query) {
                res.locals.error = 'No results match that search.';
            }

            return res.render('books/all-books', {title: 'All Books', reviews});
        } catch (err) {
            req.session.error = err.message;
            res.redirect('/');
        }
    },

    async getSearchResults(req, res, next) {
        try {

            //get any search provided by the user, if it exists
            const { dbQuery } = res.locals;
            let resourceType = res.locals.query.resource;
            const paginateOptions = {
                page: req.query.page || 1,
                limit: 10,
                sort:'-_id'
            }
            //remove the search from the session
            delete res.locals.dbQuery;
            //get all posts, 10 per page, for the current page
            let results;
            let googleBooks = [];
            switch(resourceType) {
                case 'Review': 
                    paginateOptions.populate = {path: 'book tags'};
                    results = await Review.paginate(dbQuery, paginateOptions);
                        for (let document of results.docs) {
                            const googleBooksResults = await getGoogleBook(document.book.googleBooksId);
                            document.googleBook = googleBooksResults.data;
                        }
                    break;
                case 'Book': 
                    results = await Book.paginate(dbQuery, paginateOptions);
                    for (let document of results.docs) {
                        if (!document.averageRating) {
                            await document.calculateAverageRating();
                        }
                        const googleBooksResults = await getGoogleBook(document.googleBooksId);
                        document.googleBook = googleBooksResults.data;
                        const recentReview = await Review.findOne({book: document._id}).select('tags').populate({path: 'tags'});
                        // console.log(recentReview);
                        for (let tag of recentReview.tags) {
                            document.tags.push(tag);
                        }
                    }
                    break;
                case 'Tag': 
                    results = await Tag.paginate(dbQuery, paginateOptions);
                    break;
                default :
                    results = await Book.paginate({}, paginateOptions);
                    resourceType = 'Book';
                    for (let document of results.docs) {
                        if (!document.averageRating) {
                            await document.calculateAverageRating();
                        }
                        const googleBooksResults = await getGoogleBook(document.googleBooksId);
                        document.googleBook = googleBooksResults.data;
                        const recentReview = await Review.findOne({book: document._id}).select('tags').populate({path: 'tags'});
                        // console.log(recentReview);
                        for (let tag of recentReview.tags) {
                            document.tags.push(tag);
                        }
                    }
            }

            // set the current page of results
            results.page = Number(results.page);
            // console.log(results.docs.length+' results found');
            if(!results.docs.length && res.locals.query) {
                res.locals.error = 'No results match that search.';
            }

            return res.render('books/books-read', {title: 'Books I\'ve Read', results, resourceType});
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

            const {tags, relevantReviews} = await getPopularTags(currentBook._id)
            let highestCount = 0;
            if (tags.length && relevantReviews.length) {
                // Sort tags by 'count'
                const orderedTags = tags.sort(function(a,b) {
                    return b.count - a.count;
                });
                highestCount = orderedTags[0].count;
                //Shuffle tag cloud for display
                fisherYatesShuffle(tags);
            }
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
    async searchBooks(req, res, next) {
        let foundBooks = [];
        try {
            let googleBooksResults = await getGoogleBooksResults(req.params.bookTitle, 'intitle');
            for (let book of googleBooksResults) {
                foundBook = await Book.findOne({googleBooksId: book.id}).lean();
                if (!foundBook) {
                    foundBook = await createMissingBook(book);
                }
                foundBook.googleBook = book;
                foundBooks.push(foundBook);
            }
            res.send(foundBooks);
        } catch (err) {
            foundBooks = ['No Book Found'];
            res.send(foundBooks);
        }
    }
    // async deleteBook(req, res, next) {
    //     try {
    //         //Find book in database and delete it 
    //         const removedBook = await Book.findOneAndRemove({_id: req.params.bookId});
    //         const removedReviews = await Review.findAndUpdate({book: req.params.bookId}, {
    //             status: 
    //             { 
    //                 active: false,
    //                 reason: 'Associated book removed'
    //             }
    //         });
    //         req.session.success = `The Book ${removedBook.title} has been permanently deleted, with ${removedReviews.deletedCount} associated Reviews. Review authors will be notified.`;
    //         res.redirect('/books');
    //     } catch (err) {
    //         console.error(err);
    //         req.session.error = err.message;
    //         res.redirect('/');
    //     }
    // }
    //Erring on the side of not actually deleting anything
}