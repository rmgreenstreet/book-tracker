const express = require('express');
const app = express();
const axios = require('axios').default;
const tagCloud = require('tag-cloud');
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


//Look up book using id submitted via Google Books API
async function getGoogleBook(bookId) {
    return await axios.get(booksApiUrl + bookId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);
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
            if (!currentBook.active) {
                req.session.error = "The specified book has been unpublished";
                return res.redirect('/');
            }
            //Look up book using id submitted via Google Books API
            const googleBook = await getGoogleBook(currentBook.googleBooksId);

            /* ToDo: Generate tag cloud using tag-cloud by looking up all reviews 
            for this book, adding up the number of times a specific tag is used across
            all reviews, creating an array of objects like {tagName: count} and passing 
            that to tag-cloud, then passing that into the EJS render call */

            /* get all reviews for currentBook, selecting only 'tags', and populate those
            tags, selecting only the 'title' of each tag */
            const relevantReviews = await Review.find({book: currentBook._id}, 'tags')
                .populate(
                    {
                        path:'tags',
                        select: 'title'
                    }
                )
                .exec();

            /* go through the reviews and move only their tags to a separate array, to be easier to work with */
            let relevantTags = [];
            for (let review of relevantReviews) {
                for (let tag of review.tags) {
                    relevantTags.push(tag.title);
                }
            }

            const tags = []; 
            for (let tag of relevantTags) {
                let foundIndex = tags.findIndex(function(e) {
                    return e.tagName === tag
                });
                if (foundIndex !== -1) {
                    tags[foundIndex].count++;
                    foundindex = -1;
                } else {
                    tags.push({
                        tagName: tag,
                        count: 1
                    })
                }
            };

            const cloud = tagCloud.tagCloud(tags, function(err, data) {
                return data;
            }, {
                randomize: true
            });

            res.render('books/book-details', {currentBook, googleBook: googleBook.data, cloud});
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

            //workaround to add 'modified' information until I can figure out pre/post hook for 'findOneAndUpdate'
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
            //Find book in database, then update it with active: false 
            const currentBook = await Book.findOneAndUpdate({id: req.params.bookId}, {active: false});
            req.session.success = 'The Book Has Been Unpublished!';
            res.redirect('/books');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async deleteBook(req, res, next) {
        try {
            //Find book in database and delete it 
            const currentBook = await Book.findOneAndRemove({id: req.params.bookId});
            req.session.success = 'The Book Has Been Deleted!';
            res.redirect('/books');
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    }

}