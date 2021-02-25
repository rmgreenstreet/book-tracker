const User = require('../models/user');
const passport = require('passport');
const util = require('util');
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function loginAfterChange (user,req,res) {
    console.log('logging back in after a change to account');
    const login = util.promisify(req.login.bind(req));
    await login(user);
};

async function getUserForReset (req) {
    const {token} = req.params;
    /* see 1) if the reset token exists and matches 
    the one saved in the user and 2) hasn't expired yet */
    const user = await User.findOne({
        resetPasswordToken:token,
        resetPasswordExpires: { $gt: Date.now() }
    });
    return user;
};

module.exports = {
	// GET /register
	getRegister(req, res, next) {
        if (req.isAuthenticated()) {
            req.session.error = 'Please log out to create a new account';
            return res.redirect('back'); 
        }
		res.render('register', { title: 'Book Tracking - Register', page:'register', username:'', email:''});
	},
	// POST /register
	async postRegister(req, res, next) {
        // return res.render('register');
        try {
            /* if a file was uploaded, add the image to the request body */
            if(req.file) {
                const secure_url = req.file.path;
                const public_id = req.file.filename;
                req.body.image = {secure_url, public_id};
            }

            // create a new user in the database using the request body
            const newUser = await User.register(new User(req.body), req.body.password);
            /* create an access token for this user that lasts one day, and save it to the user */
            newUser.accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });
            await newUser.save();
            //log the user in after signing up
            req.login(newUser, function(err) {
                if (err) return next(err);
                //display a success message to the user
                req.session.success = `Welcome to Book Tracker, ${newUser.username}!`;
                res.redirect('/');
            });
        }
        catch (err) {
            /*if registration fails for any reason, 
            delete the image that was uploaded from cloudinary */
            console.log(`Registration failed, deleting image ${req.file} from cloudinary`)
            await deleteProfileImage(req);
            const { username, email } = req.body;
            let error = err.message;
            if (error.includes('E11000') && error.includes('email')) {
                error = `A user with the email ${email} is already registered`;
            }
            /* send the username and email back to populate into the form so they don't have to be re-typed */
            res.render('register', { title: 'Surf Shop - Register', page:'register', username, email, error })
        }
	},
	// GET /login
	getLogin(req, res, next) {
        if(req.isAuthenticated()) {
            req.session.error = 'You are already logged in'
            return res.redirect('/');
        }
        if(req.query.returnTo) {
            /* if user was sent to login page from anywhere 'isLoggedIn' is called, 
            send them back there after logging in */
            req.session.redirectTo = req.headers.referer;
        }
		res.render('login', { title: 'Login' , page:'login'});
	},
	// POST /login
	async postLogin(req, res, next) {
        const {username, password } = req.body;
        const { user, error } = await User.authenticate('local')(username, password);
        if(!user && error) {
            req.session.error = error.message
            return res.redirect('back');
        }
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        await User.findByIdAndUpdate(user._id, { accessToken });
        req.login(user, function (err) {
            if(err){
                req.session.error = error.message
                return res.redirect('back');
            }
            req.session.success = `Welcome back, ${username}`;
            /*if they came to the login page from somewhere that called 'isLoggedIn', 
            send them back there after logging in, then remove the hook to do that */
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        });
	},
	// GET /logout
	getLogout(req, res, next) {
	  req.logout();
	  res.redirect('/');
    },
    async getProfile(req,res,next) {
        /* get the 10 most recent of this user's posts to display on the page */
        const posts = await Post.find().where('author').equals(req.user.id).limit(10).exec();
        res.render('profile', {posts, title: `Surf Shop - ${req.user.username}'s Profile`, page: 'profile'})
    },
     async updateProfile(req,res,next) {
        const { username, email } = req.body
        let { user } = res.locals;
        if(username) {
            user.username = username;
        }
        if(email) {
            user.email = email;
        }
        if(req.file) {
            if (user.image.public_id) {
                await cloudinary.uploader.destroy(user.image.public_id);
                const { secure_url, public_id} = req.file;
                user.image = { secure_url, public_id };        
            }
        }
        await user.save();
        const login = util.promisify(req.login.bind(req));
        await login(user);
        req.session.success="Profile has been updated!";
        res.redirect('/profile');
     },
     getForgotPw(req,res,next) {
        res.render('users/forgot');
     },
     async putForgotPw(req,res,next) {
         /* set a random token to identify this reset request */
        const token = await crypto.randomBytes(20).toString('hex');
        const user = await User.findOne({email:req.body.email});
        if(!user) {
            req.session.error = 'No account with this email address found: '+req.body.email;
            return res.redirect('/forgot-password');
        }
        else { 
            /* save the reset token to the user and make it only valid for 24 hours */
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000;
            await user.save();
            const msg = {
                from:{
                    email:'rgreenstreetdev@gmail.com',
                    name:'SurfShop Admin'
                },
                to:[{email:user.email}],
                subject:'Your SurfShop Password Reset Request',
                content:[{
                    type:'text/plain',
                    value:`You are receiving this because you (or someone else) have requested the reset of the password for your account.
                    Please click on the following link, or copy and paste it into your browser to complete the process:
                    http://${req.headers.host}/reset/${token}
                    If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/                /g, '')
                }]
            };
            sgMail
            .send(msg)
            .then(() => {
                //Celebrate
                req.session.success = `An email has been sent to ${user.email} with further instructions!`;
                res.redirect('/');
            })
            .catch(error => {

                //Log friendly error
                console.error(error.toString());

                //Extract error msg
                const {message, code, response} = error;

                //Extract response msg
                const {headers, body} = response;
                res.redirect('back');
            });
        }
     },
     async getReset(req,res,next) {
         const user = await getUserForReset(req);
         if(!user) {
             req.session.error = "The password reset token is invalid or expired. Please try again.";
             return res.redirect('/forgot-password');
         }
         else {
            res.render('users/reset',{token});
         }
     },
     async putReset(req,res,next) {
        const user = await getUserForReset(req);
        if(!user) {
            req.session.error = "The password reset token is invalid or expired. Please try again.";
            return res.redirect('/forgot-password');
        }
        // make sure new password and confirmation match
        if(req.body.password === req.body.confirm) {
            //set the new password
           await user.setPassword(req.body.password);
           //clear the reset token and expiration
           user.resetPasswordToken = null;
           user.resetPasswordExpires = null;
           //save the user and log back in
           await user.save();
           await loginAfterChange(user,req,res);
        } else {
            req.session.error = 'Passwords do not match!';
            return res.redirect(`/reset/${token}`);
        }
        const msg = {
            from:{
                email:'rgreenstreetdev@gmail.com',
                name:'SurfShop Admin'
            },
            to:[{email:user.email}],
            subject:'Your SurfShop Password Has Been Reset',
            content:[{
                type:'text/plain',
                value:`Hello,
                This email is to confirm that the password for your account has just been changed.
                If you did not make this change, please hit reply and notify us at once.`.replace(/            /g, '')
            }]
        };
        await sgMail.send(msg);
        req.session.success = 'Your password has been successfully changed!';
        res.redirect('/profile');
     }
}