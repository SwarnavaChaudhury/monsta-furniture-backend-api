const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()



// ****************************************************
// ****************************************************

const server = express(); // executable function

// parse requests of content-type - application/json
server.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
server.use(express.urlencoded({ extended: true }));

// body-parser package help to provide html code as API response
server.use(bodyParser.json());

// check cross origin for react or next js port or url
server.use(cors());

// ****************************************************
// ****************************************************




server.get('/', (request, response) => {
    response.send('Server is working fine!');
});




// make URL public
server.use('/uploads/categories', express.static('uploads/categories'));
server.use('/uploads/sub-categories', express.static('uploads/sub-categories'));
server.use('/uploads/sub-sub-categories', express.static('uploads/sub-sub-categories'));
server.use('/uploads/products', express.static('uploads/products'));




// Admin API URLs
require('./src/routes/admin/color.routes.js')(server);
require('./src/routes/admin/material.routes.js')(server);
require('./src/routes/admin/countries.routes.js')(server);
require('./src/routes/admin/categories.routes.js')(server);
require('./src/routes/admin/subCategories.routes.js')(server);
require('./src/routes/admin/subSubCategories.routes.js')(server);
require('./src/routes/admin/product.routes.js')(server);

require('./src/routes/admin/statusCheck.routes.js')(server);



// Website API URLs











// server.listen(8000, () => {
server.listen(process.env.PORT, () => {
    console.log("Server Running...");

    // mongoose.connect('mongodb://127.0.0.1:27017/monsta-ecom')
    // mongoose.connect(process.env.DB)
    //     .then((res) => {
    //         // console.log(res);
    //         console.log('DB Connected!');
    //     })
    //     .catch((err) => {
    //         console.log("Error occurred while connecting database || ", err);
    //     });

    mongoose.connect(process.env.DB)
        .then((res) => {
            // console.log(res);
            console.log("DB Connected!");
            server.listen(process.env.PORT, () => {
                console.log(`Server Running on PORT ${process.env.PORT}...`);
            });
        })
        .catch(err => {
            console.error("Database connection failed:", err);
            process.exit(1); // stop app if DB not connected
        });

});