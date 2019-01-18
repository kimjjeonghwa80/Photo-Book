const PhotoBookCategory = require('../../../models/photoBookCategory');
const { getError, getValidationResult } = require('../../../utils/helperFunctions');

// Add Photo Book Category
module.exports.postPhotoBookCategory = (req, res, next) => {
    
    const userInput = {
        name: req.body.name
    };

    const errors = getValidationResult(req);

    if (errors) {
        throw getError(422, 'Invalid Input', errors);
    }

    // Crate new Photo Book Category
    const photoBookCategory = new PhotoBookCategory(userInput);

    photoBookCategory.save()
        .then(() => {
            res.json({
                msg : ['Photo Book Category created Successfully']
            });
        })
        .catch(error => {
            next(error);
        });
}

// Returns Photo Book Categories
module.exports.getPhotoBookCategory = (req, res, next) => {

    // Find All Photo Book Categories
    PhotoBookCategory.findAll()
        .then(category => {
            res.json({
                result: category
            });
        })
        .catch(error => {
            next(error);
        });
}

// Deletes Photo Book Category
module.exports.deletePhotoBookCategory = (req, res, next) => {

    const id = req.params.id;

    // Find Photo Book Category
    PhotoBookCategory.findByPk(id)
        .then(photoBook => {
            if(!photoBook) {
                throw getError(404, 'No Photo Book Category Found');
            }

            photoBook.destroy()
                .then(() => {
                    res.json({
                        msg: ['Photo Book Category Deleted Successfully']
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

// Edit Photo Book Category
module.exports.putPhotoBookCategory = (req, res, next) => {
    
    const id = req.params.id;

    const errors = getValidationResult(req);

    if (errors) {
        throw getError(422, 'Invalid Input', errors);
    }

    // Find Photo Book Category
    PhotoBookCategory.findByPk(id)
        .then(photoBook => {
            if(!photoBook) {
                throw getError(404, 'No Photo Book Category Found');
            }

            photoBook.name = req.body.name;
            photoBook.save()
                .then(() => {
                    res.json({
                        msg: ['Photo Book Category Edited Successfully']
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