
const express = require('express');
const { create, view, details, update, changeStatus, destroy } = require('../../controllers/admin/category.controller');

const multer = require('multer')    // make multer as executable function
const uploads = multer({ dest: 'uploads/categories' })    // dest --> destination
// upload --> as middleware

const path = require('path')


const router = express.Router();

module.exports = server => {



    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/categories')
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
    // const multipleImage = upload.array('images', '6'); // key || number of image allowed

    // upload single and multiple image upload together
    // const singleMultiple = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 6 }])


    router.post('/create', singleImage, create);

    router.post('/view', upload.none(), view);

    router.post('/details', upload.none(), details);

    router.put('/update/:id', singleImage, update);

    router.put('/change-status', upload.none(), changeStatus);

    router.put('/delete', upload.none(), destroy);



    server.use('/api/admin/categories', router);
}