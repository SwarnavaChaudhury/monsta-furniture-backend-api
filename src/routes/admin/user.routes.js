
const express = require('express');
const { register, login, viewProfile, updateProfile, changePassword, forgotPassword, resetPassword } = require('../../controllers/admin/user.controller');

const multer = require('multer')    // make multer as executable function
const uploads = multer({ dest: 'uploads/users' })    // dest --> destination
// upload --> as middleware

const path = require('path')
var jwt = require('jsonwebtoken');


const router = express.Router();

module.exports = server => {



    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/users')
            // call back function
        },
        filename: function (req, file, cb) {
            const uniqueValue = Date.now() + '-' + Math.round(Math.random() * 1E9)

            var imagePath = path.extname(file.originalname); // extract extension name
            cb(null, file.fieldname + '-' + uniqueValue + imagePath);
        }
    })

    const upload = multer({ storage: storage })
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    const singleImage = upload.single('image');



    router.post('/register', upload.none(), register);

    router.post('/login', upload.none(), login);

    router.post('/view-profile', upload.none(), viewProfile);

    router.post('/update-profile', singleImage, updateProfile);

    router.post('/change-password', upload.none(), changePassword);

    router.post('/forgot-password', upload.none(), forgotPassword);

    router.post('/reset-password', upload.none(), resetPassword);



    server.use('/api/admin/users', router);
}