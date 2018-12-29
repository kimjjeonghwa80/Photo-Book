const User = require('../models/user');
const { validationResult } = require('express-validator/check');
const { signJwt } = require('../utils/helperFunctions');

module.exports.signUp = (req,res, next) => {

    const userInput = {
        fullName: req.body.fullName,
        email: req.body.email,
        password: req.body.password
    };

    // Extracting Validation Errors from Express Validator
    const validationError = validationResult(req).array();

    // If Validation Error Exists => Show Error Message
    if(validationError.length > 0) {
        let errors = validationError.map(obj => obj.msg);
        return res.status(422).json({
            msg: errors
        });
    }

    // Count The number of user with same email as req.body.email
    User.count({ where: { email: req.body.email } })
        .then(count => {

            // If one or more user is found with same email as req.body.email,
            // Show Error Message
            if(count > 0) {
                const errors = ['Email Already Exists'];
                return res.status(422).json({
                    msg: errors
                });
            } else {

                // If no user is found with the same email create new user
                const user = new User(userInput);

                // Save the new user into database
                user.save()
                    .then(() => {

                        // If user successfully created => Success msg.
                        res.status(201).json({
                            msg: ['User Successfully Signed Up']
                        });
                    })
                    .catch((error) => {

                        // If user cannot be created throw an error.
                        next(error);
                    });
            }
        })
        .catch((error) => {

            // If count users query cannot run, thorw an error.
            next(error);
        }); 
}

module.exports.login = (req, res, next) => {

    // Extracting Validation Errors from Express Validator
    const validationError = validationResult(req).array();

    // If Validation Error Exists => Show Error Message
    if(validationError.length > 0) {
        let errors = validationError.map(obj => obj.msg);
        return res.status(422).json({
            msg: errors
        });
    }

    // Find User With Given Email
    User.findOne({ where : { email: req.body.email } })
        .then(user => {

            // Check If user Exists with the given Email
            if(user){

                // Check for the correct password
                user.checkPassword(req.body.password)
                    .then((isMatch) => {
                        if(isMatch) {
                            // Sign JWT Token
                            signJwt(user.id, 'user', (error, token) => {
                                if(error){
                                    return next(error);
                                }
                                else {
                                    return res.status(200).json({
                                        msg: [
                                            "Logged In Successfully"
                                        ],
                                        token: token
                                    });
                                }
                            });    
                        } else {
                            let errors = ['Invalid Credentials'];
                            return res.status(422).json({
                                msg: errors
                            });
                        }
                    })
                    .catch(error => {
                        next(error);
                    });
            } else {

                // If no user exists => error message
                let errors = ['Invalid Credentials'];
                return res.status(422).json({
                    msg: errors
                });
            }
        })
        .catch(error => {
            next(error);
        });
}

// Get User Profile
module.exports.getProfile = (req, res, next) => {
    if(!req.user) {
        return;
    }

    // Find User
    User.findByPk(req.user.id, { attributes: ['id', 'fullName', 'email', 'mobile', 'createdAt', 'updatedAt'] }) 
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    msg: ['No User Found']
                });
            }

            res.json({
                result: user
            });
        })
        .catch(error => {
            next(error);
        });
}


// Update User Profile
module.exports.putProfile = (req, res, next) => {

    if(!req.user) {
        return;
    }

    const userInput = {
        fullName: req.body.fullName,
        email: req.body.email,
        mobile: req.body.mobile
    };

    // Extracting Validation Errors from Express Validator
    const validationError = validationResult(req).array();

    // If Validation Error Exists => Show Error Message
    if(validationError.length > 0) {
        let errors = validationError.map(obj => obj.msg);
        return res.status(422).json({
            msg: errors
        });
    }

    // Find User
    User.findByPk(req.user.id) 
        .then(user => {
            if(!user) {
                return res.status(404).json({
                    msg: ['No User Found']
                });
            }

            for(const key in userInput) {
                user[key] = userInput[key];
            }

            user.save()
                .then(() => {
                    res.json({
                        msg: ['User Profile Edited Successfully']
                    });
                })
                .catch(error => {
                    next(error);
                });
        })
        .catch(error => {
            next(error);
        });
}

// Handles Change Password
module.exports.changePassword = (req, res, next) => {
    if(!req.user) {
        return;
    }

    // Extracting Validation Errors from Express Validator
    const validationError = validationResult(req).array();

    // If Validation Error Exists => Show Error Message
    if(validationError.length > 0) {
        let errors = validationError.map(obj => obj.msg);
        return res.status(422).json({
            msg: errors
        });
    }

    let fetchedUser;

    // Find User
    User.findByPk(req.user.id, { attributes: ['id', 'password'] })
        .then(user => {
            fetchedUser = user;
            return user.checkPassword(req.body.password);
        })
        .then(isMatch => {
            if(isMatch) {
                fetchedUser.password = req.body.newPassword;
                fetchedUser.save()
                    .then(() => {
                        res.json({
                            msg: ['Password Changed Successfully']
                        });
                    })
                    .catch(error => {
                        next(error);
                    });
            } else {
                res.status(422).json({
                    msg: ['Incorrect Password']
                });
            }
        })
        .catch(error => {
            next(error);
        });
}