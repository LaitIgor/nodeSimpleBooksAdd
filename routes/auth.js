const express = require('express');
const { check, body } = require('express-validator');
const authController = require('../controllers/auth');
const router = express.Router();
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login',     
    [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    // second arg is default error message
    body('password', 'Please enter a password with only numbers and text and at least 5 characters')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim()
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

// Add validation middleware
router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, {req}) => {
                return User.findOne({email: value})
                .then(userDoc => {
                  if (userDoc) {
                    return Promise.reject('E-mail exists already, please pick a differene one');
                  }
                })
                // if(value === 'test@test.com') throw new Error('This email is forbidden.');
                // return true;
            })
            .normalizeEmail(),
        // second arg is default error message
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .trim()
            .isLength({min: 5})
            .isAlphanumeric(),
        body('confirmPassword').trim().custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Passwords have to match')
            } 
            return true;
        })
        

    ],
    authController.postSignup
    );

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;