const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
// const Review = require('./review');
const Tag = require('./tag');
const Schema = mongoose.Schema;
const roles = ['basic', 'supervisor', 'admin'];

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        trim: true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim: true
    },
    image: {
        url: {
            type:String,
            default:'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
        },
        public_id: String
    },
    role: {
        type: String,
        default: 'basic',
        enum: roles
    },
    accessToken: {
     type: String
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);