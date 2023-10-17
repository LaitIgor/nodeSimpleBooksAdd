const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const {MONGODB_URI} = require('./globalVars');

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection = csrf();

const curDate = new Date();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, curDate.toISOString().split('T')[0] + '-' + file.originalname)
  },
})

// Allowing only certaini file types to be saved
const fileFilter = (req, file, cb) => {
  console.log('FILE FILTER STAGE');
  if (file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/webp') {
        console.log('IFFFF');
    cb(null, true)
  } else {
    console.log('ELSEEEE');
    cb(null, false);
  }
  
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// cannot extract files from requests
app.use(bodyParser.urlencoded({ extended: false }));
// this one can. we use "image" because our for use field named "image"
app.use(multer({storage: fileStorage, fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection)
// pass messages between redirects using sessions
app.use(flash());

// this middleware provides all our req. with custom variables
// to avoid add it to every single render method instead
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use((req, res, next) => {
  // throw new Error('Dummy')
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // *1 throw new Error('Dummy');
      if (!user) return next();
      req.user = user;
      console.log('user is', user);
      next();
    })
    .catch(err => {
      // this will not trigger error handling
      // throw new Error(err);
      // this will if error is thrown in ASYNC code like above *1
      console.log('Catched an error in user find method!');
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log('Cause of fail !!! : ', error.cause,);
  // res.redirect('/500')
  res.status(500).render('500', { 
    pageTitle: 'Server error', 
    path: '/500', 
    isAuthenticated: req.isLoggedIn 
  });
})

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
