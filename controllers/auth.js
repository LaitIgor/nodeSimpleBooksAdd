const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const htmlText = `<h1>Hello from mailer</h1>`
const transporterObj = require('../globalVars');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(transporterObj)

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
    errorMessage: message,
    oldInput: {email: '', password: ''},
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('errors.array()', errors.array());
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {email, password},
      validationErrors: errors.array(),
    });
  }

  User.findOne({
    email: email,
  })
    .then(user => {
      if (!user) {
        // Setting error message using Flash package
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {email, password},
          validationErrors: [{path: 'email'}, {path: 'password'}],
        });
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
          return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: 'Invalid user credentials',
            oldInput: {email, password},
            validationErrors: [],
          });
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
    oldInput: {email: '', password: '', confirmPassword: ''},
    validationErrors: []
  })
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('errors.array()', errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {email, password, confirmPassword},
      validationErrors: errors.array(),
    });
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
      .catch(err => console.log(err))
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message,
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err) {
      console.log('error is: ', err);
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user) {
          req.flash('error', 'No account with that email found')
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then(result => {
        // req.flash('error', 'Email sent, all good!')
        // res.redirect('/')
        const email = req.body.email;
        console.log('SENDING EMAIL to... ====>>>>', email);
        return transporter.sendMail({
          from: 'Node books reset pass',
          to: email,
          subject: 'Password reset',
          html: `<p>You requested a password rest</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>`,

        }).then(() => {
          console.log('Email sent!');
        res.redirect('/login')
      })
      })
      .catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token, 
    resetTokenExpiration: {$gt: Date.now()}
  })
  .then(user => {
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0]
    } else {
      message = null;
    }
    return res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    })
  })
  .catch(err => console.log('error is: ', err))
  
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  console.log('Posting new password!');

  User.findOne({
    resetToken: passwordToken, 
    resetTokenExpiration: {$gt: Date.now()},
    _id: userId,
  })
    .then(user => {
      console.log('Did it find user?', user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => console.log('error is: ', err))

}