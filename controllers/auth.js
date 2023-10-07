const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const htmlText = `<h1>Hello from mailer</h1>`
const transporterObj = require('../globalVars');

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