const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const Tag = require('./tag');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const bookSchema = new Schema({

    title: String,
    googleBooksID: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
      }
    ],
    isbn_10: Number,
    isbn_13: Number,
    // tags: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Tag'
    //   }
    // ],
    averageRating: Number

});

bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book',bookSchema);