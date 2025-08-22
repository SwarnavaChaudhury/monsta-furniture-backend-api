// all functions will declared here
require('dotenv').config()

// console.log(process.env)

const subSubCategoryModel = require("../../models/subSubCategory");

exports.create = async (request, response) => {


    const saveData = request.body;
    if (request.file) {
        saveData.image = request.file.filename;
    }


    try {

        const insertData = new subSubCategoryModel(saveData);

        await insertData.save()
            .then((result) => {
                const output = {
                    _status: true,
                    _message: 'Record Inserted!',
                    _data: result
                }
                response.send(output);
            })
            .catch((error) => {

                console.log(error);
                console.log(error.errors);

                // Collect mongoose validation errors (if any)
                let errorMessage = [];
                if (error.errors) {
                    for (let err in error.errors) {
                        errorMessage.push(error.errors[err].message);
                    }
                }

                const output = {
                    _status: false,
                    _message: 'Something went wrong!',
                    _data: null,
                    _error_message: errorMessage.length ? errorMessage : [error.message]
                }
                response.send(output);
            })

    }
    catch (error) {

        // console.log(error);

        const output = {
            _status: false,
            _message: 'Sub Sub-Category validation failed!',
            _data: null
        }
        response.send(output);
    }

}

exports.view = async (request, response) => {


    const addCondition = [
        {
            deleted_at: null,
        }
    ];

    const orCondition = [];

    if (request.body != undefined) {
        if (request.body.name != undefined) {
            if (request.body.name != '') {
                var name = new RegExp(request.body.name, 'i');
                orCondition.push({
                    name: name
                })
            }
        }

        if (request.body.parent_category_id != undefined) {
            if (request.body.parent_category_id != '') {
                addCondition.push({
                    parent_category_id: request.body.parent_category_id
                })
            }
        }

        if (request.body.child_category_id != undefined) {
            if (request.body.child_category_id != '') {
                addCondition.push({
                    child_category_id: request.body.child_category_id
                })
            }
        }

    }

    if (addCondition.length > 0) {
        var filter = { $and: addCondition }
    } else {
        var filter = {}
    }

    if (orCondition.length > 0) {
        filter.$or = orCondition;
    }







    // pagination

    var current_page = 1;
    var limit = 5;
    var skip = (current_page - 1) * limit;

    if (request.body != undefined) {
        var current_page = request.body.page ? request.body.page : current_page;
        var limit = request.body.limit ? request.body.limit : 5;
        var skip = (current_page - 1) * limit;
    }

    // show total number of rows available in table
    let totalRecords = await subSubCategoryModel.find(filter).countDocuments();
    let total_pages = Math.ceil(totalRecords / limit);







    await subSubCategoryModel.find(filter)
        .select('_id name image order status')
        .populate('parent_category_id', "name")
        .populate('child_category_id', "name")
        .limit(limit).skip(skip)
        // .sort({
        //     order: 'asc'
        // })
        .sort({
            _id: 'desc'
        })
        .then((result) => {
            if (result.length > 0) {
                const output = {
                    _status: true,
                    _message: 'Record Found!',
                    _pagination: {
                        current_page: current_page,
                        total_pages: total_pages,
                        total_records: totalRecords
                    },
                    _image_path: process.env.sub_sub_category_image,
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

exports.details = async (request, response) => {

    await subSubCategoryModel.findById(request.body.id)
        .then((result) => {
            if (result) {
                const output = {
                    _status: true,
                    _message: 'Record Found!',
                    _image_path: process.env.sub_sub_category_image,
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

exports.update = async (request, response) => {

    ///////////////////////////////////////
    const saveData = request.body;
    if (request.file) {
        saveData.image = request.file.filename;
    }
    ///////////////////////////////////////

    await subSubCategoryModel.updateOne({
        _id: request.params.id
    }, {
        // $set: request.body
        $set: saveData
    })
        .then((result) => {
            const output = {
                _status: true,
                _message: 'Record Updated!',
                _data: result
            }
            response.send(output);
        })
        .catch((err) => {

            const output = {
                _status: false,
                _message: 'Something went wrong!',
                _data: null
            }
            response.send(output);
        })

}

exports.changeStatus = async (request, response) => {
    try {
        const ids = request.body.id;

        // check while array of id is received or not
        if (!Array.isArray(ids) || ids.length === 0) {
            return response.send({
                _status: false,
                _message: 'Invalid ID array',
                _data: null
            });
        }

        // return an array of object contains full data of correspond ids
        const categories = await subSubCategoryModel.find({ _id: { $in: ids } });

        // if id is received but those ids are invalid
        if (!categories.length) {
            return response.send({
                _status: false,
                _message: 'No matching categories found',
                _data: null
            });
        }

        // update status of those ids one by one
        const updatePromises = categories.map(category =>
            subSubCategoryModel.updateOne({
                _id: category._id
            }, {
                $set: {
                    status: !category.status
                }
            })
        );

        // waits for all the asynchronous update operations to complete before moving forward
        await Promise.all(updatePromises);

        return response.send({
            _status: true,
            _message: 'Status changed successfully!',
            _data: categories.map(cate => ({ id: cate._id, previous_status: cate.status, new_status: !cate.status }))
        });

    } catch (error) {
        console.error('changeStatus error:', error);
        return response.send({
            _status: false,
            _message: 'Something went wrong!',
            _data: null
        });
    }
}

exports.destroy = async (request, response) => {

    await subSubCategoryModel.updateMany({
        _id: {
            $in: request.body.id
            // accept array
        }
    }, {
        $set: {
            deleted_at: Date.now()
        }
    })
        .then((result) => {
            const output = {
                _status: true,
                _message: 'Record Removed!',
                _data: result
            }
            response.send(output);
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