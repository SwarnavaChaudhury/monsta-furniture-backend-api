
const express = require('express');
const { create, view, details, productDetails, update, changeStatus, destroy } = require('../../controllers/admin/products.controller');

const multer = require('multer')    // make multer as executable function
const uploads = multer({ dest: 'uploads/products' })    // dest --> destination
// upload --> as middleware

const path = require('path')


const router = express.Router();

module.exports = server => {



    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/products')
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


    // const singleImage = upload.single('image');
    // const multipleImage = upload.array('images', '6'); // key || number of image allowed

    // upload single and multiple image upload together
    const singleMultiple = upload.fields(
        [
            { name: 'front_image', maxCount: 1 },
            { name: 'back_image', maxCount: 1 },
            { name: 'image_gallery', maxCount: 6 },
        ]
    )


    router.post('/create', singleMultiple, create);

    router.post('/view', upload.none(), view);

    router.post('/details', upload.none(), details);

    router.post('/product-details', upload.none(), productDetails);

    router.put('/update/:id', singleMultiple, update);

    router.put('/change-status', upload.none(), changeStatus);

    router.put('/delete', upload.none(), destroy);



    server.use('/api/admin/products', router);
}