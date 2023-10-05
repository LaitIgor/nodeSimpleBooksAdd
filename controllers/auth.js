const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  // console.log('req.flash(error)', req.flash('error'));
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    // extracting error message from Flash package using key
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
    email: email,
  })
    .then(user => {
      if (!user) {
        // Setting error message using Flash package
        req.flash('error', 'Invalid email or password');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
      // we enter then in both match and not match scenarios
        .then(doMatch => {
          console.log('doMatch', doMatch);
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
          //   We wrap redirect in this function so that redicrect fires
          // after async operation of saving session
            return req.session.save((err) => {
              console.warn('Error: ', err);
              return res.redirect('/');
            })
          }
          req.flash('error', 'Invalid email or password');
          res.redirect('/login');
        })
        // For errors
        .catch(err => {
          console.log('err', err);
          return res.redirect('/login');
        })
    
    
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
   User.findOne({email: email})
      .then(userDoc => {
        if (userDoc) {
          req.flash('error', 'E-mail exists already, please pick a differene one');
          return res.redirect('/signup')
        }
        // its an async func, thats why we return
        return bcrypt.hash(password, 12)
        .then(hashedPass => {
          const user = new User({
            email,
            password: hashedPass,
            cart: {
              items: []
            }
          });
        return user.save();
        })
        .then(result => {
          res.redirect('/login')
        })
      })
      .catch(err => console.log(err))
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  })
}