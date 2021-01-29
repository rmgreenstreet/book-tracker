const express = require('express');
const app = express();
const axios = require('axios').default;
if (app.get('env') == 'development'){ require('dotenv').config(); }
const Book = require('../models/book');
// const {google} = require('googleapis');
// const googleBooks = google.books({
//     version: 'v1',
//     auth: process.env.GOOGLE_BOOKS_API_KEY    
// });

const booksApiUrl = 'https://www.googleapis.com/books/v1/volumes/'

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
            const googleBook = await axios.get(booksApiUrl + req.body.bookId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);

            // const googleBook = await googleBooks.get({id: req.body.bookId});
            console.log(googleBook.data);
            let newBook = await Book.create({
                title: googleBook.data.volumeInfo.title,
                googleBooksId: googleBook.data.id,
                createdBy: req.user.id
            });
            res.redirect('/books/'+newBook.id);
        } catch (err) {
            console.error(err.message);
            res.redirect('/');
        }
    },
    async findBook(req, res, next) {
        try {
            //Find book in database
            const currentBook = await Book.findOne({id: req.params.bookId, active:true});
            //Look up book using id submitted via Google Books API
            const googleBook = await axios.get(booksApiUrl + currentBook.googleBooksId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);

            res.render('/books/book-details', {currentBook, googleBook: googleBook.data});
        } catch (err) {
            console.error(err);
            req.session.error = err.message;
            res.redirect('/');
        }
    },
    async updateBook(req, res, next) {
        try {
            //Find book in database, then update it
            const currentBook = await Book.findOneAndUpdate({id: req.params.bookId}, req.body);
            //Look up book using id submitted via Google Books API
            const googleBook = await axios.get(booksApiUrl + currentBook.googleBooksId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);
            req.session.success = 'Book Information Updated!';
            res.render('/books/book-details', {currentBook, googleBook: googleBook.data});
        } catch (err) {
            console.error(err);
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