

const express = require('express');
const app = express();
if (app.get('env') == 'development'){ require('dotenv').config(); }
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
//configure cloudinary upload settings
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: ('book_tracker/'+process.env.CLOUDINARY_FOLDER+'posts'),
    allowedFormats: ['jpeg', 'jpg', 'png'],
    filename: function (req, file, cb) {
        let buf = crypto.randomBytes(16);
        buf = buf.toString('hex');
        let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/ig, '');
        uniqFileName += buf;
        
      cb(undefined, uniqFileName );
    }
  });

async function imageDelete(public_id, post) {
    //remove image from cloudinary
    await cloudinary.uploader.destroy(public_id);
    // delete image from post.images array
    for(const image of post.images) {
        if(image.public_id === public_id) {
            post.images.splice(post.images.indexOf(image), 1);
        }
    }
}
  
  module.exports = {
      cloudinary,
      storage,
      imageDelete
  }