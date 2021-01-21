const express = require('express');
const app = express();
const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const User = require('../models/user');const util = require('util');
const { cloudinary } = require('../cloudinary');
// const { deleteProfileImage } = require('../middleware');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { getRegister } = require('.');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
if (app.get('env') == 'development'){ require('dotenv').config(); }

module.exports = {

	// GET /register
	getRegister(req, res, next) {
		res.render('register', { title: 'Book Tracking - Register', page:'register', username:'', email:''});
    },
    
    // POST /register
    async createUser(req, res, next) {
        try {
            /* if a file was uploaded, add the image to the request body */
            if(req.file) {
                const { secure_url, public_id } = req.file;
                req.body.image = {secure_url, public_id};
            }
            // create a new user in the database using the request body
            const user = await User.register(new User(req.body), req.body.password);
            //log the user in after signing up
            req.login(user, function(err) {
                if (err) return next(err);
                //display a success message to the user
                req.session.success = `Welcome to Surf Shop, ${user.username}!`;
                res.redirect('/');
            });
        }
        catch (err) {
            /*if registration fails for any reason, 
            delete the image that was uploaded from cloudinary */
            deleteProfileImage(req);
            const { username, email } = req.body;
            let error = err.message;
            if (error.includes('E11000') && error.includes('email')) {
                error = `A user with the email ${email} is already registered`;
            }
            /* send the username and email back to populate into the form so they don't have to be re-typed */
            res.render('register', { title: 'Surf Shop - Register', page:'register', username, email, error })
        }
    },
    async findUser() {

    },
    async updateUser() {

    },
    async deleteUser() {
        
    }

}