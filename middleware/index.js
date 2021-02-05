// const Review = require('../models/review');
const User = require('../models/user');
const { cloudinary } = require('../cloudinary');

function escapeRegExp(string) {
	return string.replace(/[.*+?^${}|]/g,'\\$&'); //$& means any character in the whole string
}

const middleware = {
	asyncErrorHandler: (fn) =>
		(req, res, next) => {
			Promise.resolve(fn(req, res, next))
						 .catch(next);
		},
	/* see if the currently logged in user is the one who wrote the review 
	attempting to be changed */
	async isReviewAuthor (req,res,next) {
		let review = await Review.findById(req.params.review_id);
		if (review.author.equals(req.user._id)) {
			return next();
		}
		req.session.error = "This review does not belong to you."
		return res.redirect(`/posts/${req.params.id}`);
	},
	/* see if a user is logged in before allowing user-only actions */
	async isLoggedIn (req,res,next) {
		if(req.isAuthenticated()) return next();
		req.session.error = 'You need to be logged in to do that!';
		req.session.redirectTo = req.originalUrl;
		res.redirect('/login');
	},
	/* see if the currently logged in user is the one who created the post 
		attempting to be changed */
	async isPostAuthor (req,res,next) {
		const post = await Post.findById(req.params.id);
		if(post.author.equals(req.user._id)){
			res.locals.post=post;
			return next();
		}
		req.session.error='Access Denied!'
		res.redirect('back')
	},
	/* before changing the password in the profile edit form, 
	make sure the old password provided is correct */
	async isValidPassword (req,res,next) {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if(user){
			console.log('found user');
			//add user to res.locals
			res.locals.user = user
			next();
		}
		else {
			console.log('no user found');
			middleware.deleteProfileImage(req);
			req.session.error = "Incorrect current password!";
			return res.redirect('/profile');
		}
	},
	/*  */
	async changePassword (req,res,next) {
		const {
			newPassword,
			passwordConfirmation,
		} = req.body;
		/* if user entered a new password, but left the confirmation blank, let them know */
		if(newPassword && !passwordConfirmation) {
			req.session.error = 'Missing password confirmation!';
			middleware.deleteProfileImage(req);
			return res.redirect('/profile');
		}
		/* if a new password was entered, change it in the user's document */
		else if(newPassword && passwordConfirmation) {
			console.log('user wants to change password')
			const { user } = res.locals;
			// make sure new password and confirmation match
			if(newPassword === passwordConfirmation) {
				console.log('passwords match');
				//if they match, set the new password
				await user.setPassword(newPassword);
				next();
			} else {
				console.log('passwords do not match');
				// middleware.deleteProfileImage(req); /* not sure why I left this here */
				req.session.error = "New passwords do not match!"
				return res.redirect('/profile');
			}
		} else {
			next();
		}
	},
	async deleteProfileImage (req,res,next) {
		if (req.file) {	
			console.log(`deleting ${req.file.filename}`);
			await cloudinary.uploader.destroy(req.file.filename);
			console.log(req.file.filename + 'deleted');
		}
	},
	async searchAndFilterPosts(req,res,next) {
		/* pull the keys from req.query (if there are any) and assign them
		to queryKeys variable as an array of string values */
		const queryKeys = Object.keys(req.query);
		//Object.keys extracts the keys (not values) from an object and puts them into an array
		/* 
		check if queryKeys array has any values in it
		if true then we know that req.query has properties
		which means the user:
		a) clicked a paginate button (page number)
		b) submitted the search/filter form
		c) both a and b
		*/
		if(queryKeys.length) {
			//initialize an empty array to store our db queries {objects}
			const dbQueries=[];
			//destructure all potential properties from req.query
			let {search, avgRating, author } = req.query;
			/* check if user submitted text search terms */
			if(search) {
				search = new RegExp(escapeRegExp(search), 'gi');
				/* create a db query object and push it into the dbqueries array 
				now the database will know to search the title, description, & location
				fields, using the search regular expression*/
				dbQueries.push({$or: [
					{title: search},
					{text: search}
				]});
			}
			if(avgRating) {
				/* create a dbquery object that finds any post documents where the average rating value 
				is greater than or equal to the user's request */
				dbQueries.push({
					avgRating:{$gte:avgRating}
				});
			}
			if(author) {
				/* add the resource type to dbqueries */
				dbQueries.push({author: author});
			}
			/* 
			pass database query to next middleware route's middleware chain
			which is the postIndex method from /controllers */
			res.locals.dbQuery = dbQueries.length ? {$and: dbQueries } : {};
		}
		/* pass database query to the view as a local variable (req.query) to be used in the searchAndFilter.ejs partial
		This allows us to maintain the state of the searchAndFilter form */
		res.locals.query = req.query;

		/* build the paginateUrl for pagination partial
		first remove 'page' string value from the queryKeys array, if it exists */
		queryKeys.splice(queryKeys.indexOf('page'),1);
		/* now check if queryKeys has any other values, if it does then we know the user submitted the search/filter form
		if it doesn't then they are on /posts or a specific page from /posts, e.g., /posts?page=2
		we assign the delimiter based on whether or not the user submitted the search/filter form
		e.g., if they submitted the search/filter form then we want page=N to come at the end of the query string
		e.g., /posts?search=surfboard&page=N
		but if they didn't submit the search/filter form then we want it to be the first (and only) value in the query string,
		which would mean it needs a ? delimiter/prefix
		e.g., /posts?page=N */
		const delimiter = queryKeys.length ? '&' : '?';
		/* build the paginateUrl local variable to be used in pagination.ejs partial
		do this by taking the originalUrl and replacing any match of ?page=N or &page=N with an empty string, 
		then append the proper delimiter and page= to the end.
		the actual page number gets assigned in the pagination partial */
		res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g,'')+`${delimiter}page=`;
		//once aaaaaalllllll of that is done, move to the next Middlware in the postIndex controller
		next();
	}
};

module.exports=middleware;
