const path = require('path');
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const connectDB = require('./config/db');

// Load config
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);

connectDB();

const app = express();

// Development Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static Folder
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/public', express.static(__dirname + "/public"));
//app.use(express.static('public'))

// Handlebars
app.engine('.hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// Sessions
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



//Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/note', require('./routes/notes'));
app.use('/cart', require('./routes/cart'));
app.use('/review', require('./routes/Review'))
app.use('/payment', require('./paytm/paytm'))

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
