const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Review = require('./review');
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

// bookSchema.pre('findOneAndUpdate', async () => {
//     const docToUpdate = await this.model.findOne(this.getQuery());
//     // this.set({'modified.by': 'req.user.id', 'modified.at': Date.now()})
//     docToUpdate.modified.by = req.user.id;
//     docToUpdate.modified.at = Date.now();
//     // await docToUpdate.save();
// });

bookSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Book',bookSchema);