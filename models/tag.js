const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const tagSchema = new Schema({

    title: {
        type: String,
        immutable: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        immutable: true
    },
    created: {
        type: Date,
        default: Date.now(),
        required: true,
        immutable: true
    },
    description: {
        type: String.apply,
        required: true
    }

});

tagSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Review',tagSchema);