const axios = require('axios');

const Book = require('../models/book');
const Review = require('../models/review');

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
        const action = state ? 'Published' : 'Upublished';
        req.session.success = `The Book Has Been ${action}!`;
    },
    async getPopularTags(bookId, limit) {
        /* get all reviews for currentBook, selecting only 'tags', and populate those tags */
        let relevantReviews
            if (limit) {
                relevantReviews = await Review.find({book: bookId}, 'tags')
                    .populate(
                        {
                            path:'tags'
                        }
                    )
                    .limit(limit)
                    .exec();
            } else {
                relevantReviews = await Review.find({book: bookId}, 'tags')
                    .populate(
                        {
                            path:'tags'
                        }
                    )
                    .exec();
                }

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

            return {tags, relevantReviews};
    }


}





