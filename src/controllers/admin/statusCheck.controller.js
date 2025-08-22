// all functions will declared here
require('dotenv').config()

// console.log(process.env)
const colorModel = require("../../models/Color");

const categoryModel = require("../../models/Category");
const subCategoryModel = require("../../models/subCategory");
const subSubCategories = require("../../models/subSubCategory");





exports.enableCategoryStatus = async (request, response) => {

    try {

        const addCondition = {
            deleted_at: null,
            status: true,
        };


        await categoryModel.find(addCondition)
            .sort({
                _id: 'desc'
            })
            .then((result) => {
                if (result.length > 0) {
                    const output = {
                        _status: true,
                        _message: 'Record Found!',
                        _data: result
                    }
                    response.send(output);
                } else {
                    const output = {
                        _status: false,
                        _message: 'No Record Found!',
                        _data: null
                    }
                    response.send(output);
                }
            })
            .catch(() => {
                const output = {
                    _status: false,
                    _message: 'Something went wrong!',
                    _data: null
                }
                response.send(output);
            })



    }
    catch (error) {

        // console.log(error);

        const output = {
            _status: false,
            _message: 'Error Occurred',
            _data: null
        }
        response.send(output);
    }

}