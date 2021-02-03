//Require packages
const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

//Require models
const User = require('./models/user');
const Tag = require('./models/tag');

//Require dev functions
const { seetDatabase } = require('./seeds');

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

require('mongoose-type-url');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var booksRouter = require('./routes/books');
var tagsRouter = require('./routes/tags');
const seedDatabase = require('./seeds');

const app = express();

//connect to database
mongoose.connect(process.env.DATABASE_URL,{
	useNewUrlParser:true, 
	useUnifiedTopology:true,
  useFindAndModify: false,
  useCreateIndex:true
}).then(() => {
	console.log('Connected to Mongo DB');
}).catch(err => {
	console.log('Mongoose error: ',err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('express-session')({
  secret:"more things in the world",
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


//set local variables middleware
app.use(async function (req,res,next) {
  // req.user = await User.authenticate()('bob','password');
  // req.user = User.findOne({username: 'bob'});
  if (app.get('env') == 'development'){ 
    req.user = {
      'id':'6011d61a04abe04708edfb5f',
      'username':'bob',
      'role': 'owner'
    }
  };
	res.locals.currentUser = req.user;
	//set success flash message
	res.locals.success = req.session.success || "";
	//delete flash message after sending it to the page so it doesn't show again
	delete req.session.success;
	//set error flash message
	res.locals.error = req.session.error || "";
	//delete flash message after sending it to the page so it doesn't show again
	delete req.session.error;
	//continue on to the next function in the middlware/route chain
	next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/books', booksRouter);
app.use('/tags', tagsRouter);


if (app.get('env') == 'development'){ 
  require('dotenv').config(); 
};

app.use(async (req, res, next) => {
  if (req.headers["x-access-token"]) {
    const accessToken = req.headers["x-access-token"];
    const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) { 
    return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
    } 
    res.locals.loggedInUser = await User.findById(userId); next(); 
  } else { 
    next(); 
  } 
 });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// seedDatabase();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}
app.listen(port, () => {
	console.log("server has started, listening on port "+port);
});

module.exports = app;
