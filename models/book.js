const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
// const Tag = require('./tag');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const bookSchema = new Schema({

    title: {
        type: String,
        immutable: true
    },
    googleBooksID: {
        type: String,
        immutable: true
    },
    // reviews: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Review'
    //   }
    // ],
    isbn_10: {
        type: Number,
        immutable: true
    },
    isbn_13: {
        type: Number,
        immutable: true
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag'
      }
    ],
    averageRating: Number,
    numberOfRatings: Number

});

/* Todo later - method to update total and average rating for the book when
a new review is published */
bookSchema.methods.updateRatings = async function (cb) {
    const allRatings = await Review.find({book: this._id}).select('starRating');
    const ratingsTotal = allRatings
        .map(c => c.starRating)
        .reduce(function(t,c) {
            return t + c;
        });
    this.averageRating = ratingsTotal / allRatings.length();
    this.numberOfRatings = allRatings.length();
    this.save();
}

bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book',bookSchema);