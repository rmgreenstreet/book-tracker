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
    googleBooksId: {
        type: String,
        immutable: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        immutable: true
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag'
      }
    ],
    averageRating: Number,
    numberOfRatings: Number,
    active: {
        type: Boolean,
        default: true
    },
    modified: {
        by: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        at: {
            type: Date
        }
    }

});

/* Todo later - method to update total and average rating for the book when
a new review is published */
bookSchema.methods.calculateAverageRating = async function() {
    console.log('calculating averate rating')
    console.log('book\'s current average rating is: '+this.averageRating);
    let reviewTotal = 0;
    let allReviews = await Review.find({book: this._id});
    if(allReviews && allReviews.length) {
      allReviews.forEach(review => {
        reviewTotal += review.starRating;
      });
      this.averageRating = Math.round((reviewTotal/allReviews.length)*4)/4;
      //apply average rating to the post
      console.log('review total is: '+reviewTotal);
      this.averageRating = (reviewTotal/allReviews.length);
      this.numberOfRatings = allReviews.length;
    }
    else {
        this.averageRating = reviewTotal;
    }
    
    console.log('book\'s new average rating is: '+this.averageRating);
    this.save();
    const floorRating = Math.floor(this.averageRating);
    return floorRating;
};

// bookSchema.pre('findOneAndUpdate', async () => {
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     // this.set({'modified.by': 'req.user.id', 'modified.at': Date.now()})
//     docToUpdate.modified.by = req.user.id;
//     docToUpdate.modified.at = Date.now();
//     // await docToUpdate.save();
// });

bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book',bookSchema);