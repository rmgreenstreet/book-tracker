const axios = require('axios');

const Book = require('../models/book');

const booksApiUrl = 'https://www.googleapis.com/books/v1/volumes/'

module.exports = {

    //Implement Fisher-Yates(-Knuth) shuffle--for tags/tag cloud
    fisherYatesShuffle (arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            const swapIndex = Math.floor(Math.random() * (i + 1))
            const currentItem = arr[i]
            const itemToSwap = arr[swapIndex]
            arr[i] = itemToSwap
            arr[swapIndex] = currentItem
        }
        return arr
    },
    //Look up book using id submitted via Google Books API
    async getGoogleBook(bookId) {
        return await axios.get(booksApiUrl + bookId + '?key=' + process.env.GOOGLE_BOOKS_API_KEY);
    },
    //flip whether book is published or unpublished (active: true/false);
    async flipPublished(req, state) {
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


}





