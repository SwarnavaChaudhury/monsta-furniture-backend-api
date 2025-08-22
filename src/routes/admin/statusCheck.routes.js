const express = require('express');

const { enableCategoryStatus } = require('../../controllers/admin/statusCheck.controller');

const router = express.Router();

module.exports = server => {


    router.post('/enable-category-list', enableCategoryStatus);




    server.use('/api/admin/status', router);
}