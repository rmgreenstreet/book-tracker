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

            const googleBook = await axios.get(booksApiUrl + req.body.bookId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);

            // const googleBook = await googleBooks.get({id: req.body.bookId});
            console.log(googleBook.data);
            let newBook = req.body;
            res.redirect('/');
        } catch (err) {
            console.error(err.message);
            res.redirect('/');
        }
    },
    async findBook(req, res, next) {

    },
    async updateBook(req, res, next) {

    },
    async deleteBook(req, res, next) {
        
    }

}