// all routes will build here for colors - add / delete / update / change status etc.

const express = require('express');
const { create, view, details, update, changeStatus, destroy } = require('../../controllers/admin/color.controller');

const router = express.Router();

module.exports = server => {


    router.post('/create', create);

    router.post('/view', view);

    router.post('/details', details);

    router.put('/update/:id', update);

    router.put('/change-status', changeStatus);

    router.put('/delete', destroy);



    server.use('/api/admin/color', router);
}