const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Book = require('./book');
// const User = require('./user');
// const Tag = require('./tag');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const reviewSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
      },
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
        immutable: true
      },
    starRating: {
        type:Number,
        min: 1,
        max: 5,
        default: 5,
        required: true
    },
    text: {
        type: String,
        default: 'This user has read this book and given it a rating, but has not written a review.'
    },
    public: {
        type: Boolean,
        default: true
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag'
          }
    ],
    created: {
        type: Date,
        default: Date.now(),
        required: true,
        immutable: true
    },
    bookStartedDate: {
        type: Date,
        default: Date.now(),
        required: true
    },
    bookFinished: {
        type: Boolean,
        default: false
    },
    bookFinishedDate: {
        type: Date,
        required: function() {return this.bookFinished}
    },
    status: {
        active: {
            type: Boolean,
            default: true,
            required: true
        },
        reason: String
    },
    favorite: Boolean,
    modified: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        at: Date
    },
    slug: {
        type: String
    }

});

//generate url slug using post title and date created
async function slugWithDate(text) {
    let myText = text.toString()
        .toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
      
    let date = moment(this.created)
    , formatted = date.format('YYYY[-]MM[-]DD[-]');

    return formatted + myText;
  
  }

  reviewSchema.pre('save', async function (next) {
    this.slug = await slugWithDate(this.title);
    next();
  });

reviewSchema.pre('updateOne', async function (next) {
    this.slug = await slugWithDate(this.title);
    if (this.gaveUpReading) {
        this.currentlyReading = false;
        this.bookFinished = false;
        this.bookFinishedDate = Date.now();
        this.starRating = 1;
    }
});

reviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Review', reviewSchema);