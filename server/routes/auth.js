const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const validator = require('../middlewares/validator');
const authenticator = require('../middlewares/authenticator');

router.post('/signup', validator.userSignUp, authController.signUp);

router.post('/login', validator.userLogin, authController.login);

router.get('/secret', authenticator(), authController.secret);

module.exports = router;