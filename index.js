const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');




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




server.get('/', ( request, response ) => {
    response.send('Server is working fine!');
});





// Admin API URLs
require('./src/routes/admin/color.routes.js')(server);
require('./src/routes/admin/material.routes.js')(server);



// Website API URLs











server.listen(8000, () => {
    console.log("Server Running...");

    mongoose.connect('mongodb://127.0.0.1:27017/monsta-ecom')
        .then((res) => {
            // console.log(res);
            console.log('DB Connected!');
        })
        .catch((err) => {
            console.log("Error occurred while connecting database || ", err);
        });

});