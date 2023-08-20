const express = require('express');
const router = express.Router();
const notFound = require('../controllers/404');

router.use('/', notFound.get404Page);

module.exports = router;