const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const logSchema = new Schema({

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
        type: String
    }

});

logSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Log',logSchema);