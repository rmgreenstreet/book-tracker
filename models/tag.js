const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate');
const moment = require('moment');

const reviewSchema = new Schema({



});

reviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Review',reviewSchema);