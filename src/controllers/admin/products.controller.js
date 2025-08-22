// all functions will declared here
require('dotenv').config()


const fs = require('fs');
const path = require('path');


// console.log(process.env)

const productModel = require("../../models/Product");
const categoryModel = require("../../models/Category");
const subCategoryModel = require("../../models/subCategory");
const subSubCategoryModel = require("../../models/subSubCategory");

var slugify = require('slugify');



const generateUniqueSlug = async (modal, slug) => {

    let count = 0;
    var actualSlug = slug;

    // while loop run until slug found in database
    while (await modal.findOne({ slug: actualSlug })) {
        count++;
        actualSlug = `${slug}-${count}`;
    }

    return actualSlug;
}





exports.create = async (request, response) => {


    // console.log(request.file); // for handling single file
    // console.log(request.file.filename);
    // console.log(request.files); // for handling multiple files



    const saveData = request.body;
    // if (request.file) {
    //     saveData.image = request.file.filename;
    // }

    // manage multiple files upload
    if (request.files && request.files.front_image) {
        saveData.front_image = request.files.front_image[0].filename;
    }
    if (request.files && request.files.back_image) {
        saveData.back_image = request.files.back_image[0].filename;
    }
    if (request.files && request.files.image_gallery) {
        saveData.image_gallery = request.files.image_gallery.map(file => file.filename);
    } else {
        saveData.image_gallery = [];
    }


    var slug = slugify(request.body.name, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: undefined, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        strict: true,     // strip special characters except replacement, defaults to `false`
        locale: 'vi',      // language code of the locale to use
        trim: true         // trim leading and trailing replacement chars, defaults to `true`
    });
    saveData.slug = await generateUniqueSlug(productModel, slug);



    try {

        // const insertData = new productModel(request.body);
        const insertData = new productModel(saveData);

        await insertData.save()
            .then(async (result) => {



                // after product is created then update product id in category, sub-category, sub-sub-category table for show products in category wise in website
                if (request.body.parent_category_ids != undefined && request.body.parent_category_ids != '') {
                    await categoryModel.updateMany({
                        _id: request.body.parent_category_ids
                    }, {
                        $push: {
                            product_ids: {
                                $each: [result._id]
                            }
                        }
                    })
                }
                if (request.body.sub_category_ids != undefined && request.body.sub_category_ids != '') {
                    await subCategoryModel.updateMany({
                        _id: request.body.sub_category_ids
                    }, {
                        $push: {
                            product_ids: {
                                $each: [result._id]
                            }
                        }
                    })
                }
                if (request.body.sub_sub_category_ids != undefined && request.body.sub_sub_category_ids != '') {
                    await subSubCategoryModel.updateMany({
                        _id: request.body.sub_sub_category_ids
                    }, {
                        $push: {
                            product_ids: {
                                $each: [result._id]
                            }
                        }
                    })
                }
                ///////////////////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////////////////


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
            _message: 'product validation failed!',
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
                }, {
                    code: name
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
    var limit = 10;
    var skip = (current_page - 1) * limit;

    if (request.body != undefined) {
        var current_page = request.body.page ? request.body.page : current_page;
        var limit = request.body.limit ? request.body.limit : current_page;
        var skip = (current_page - 1) * limit;
    }

    // show total number of rows available in table
    let totalRecords = await productModel.find(filter).countDocuments();
    let total_pages = Math.ceil(totalRecords / limit);







    await productModel.find(filter)
        .populate('parent_category_ids', 'name') // fetch name from referenced table using id --> mentioned ids in model, display property
        .populate('sub_category_ids', 'name') // reference already mentioned in model
        .populate('sub_sub_category_ids', 'name')
        .populate('material_ids', 'name')
        .populate('color_ids', 'name')
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
                    // _image_path: 'http://localhost:8000/uploads/categories/',
                    _image_path: process.env.product_image,
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


// fetch product details by id when it edit --> without relation
exports.details = async (request, response) => {

    await productModel.findById(request.body.id)
        .then((result) => {
            if (result) {
                const output = {
                    _status: true,
                    _message: 'Record Found!',
                    _image_path: process.env.product_image,
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

// fetch product details by id when it show as single product --> with relation with other tables
exports.productDetails = async (request, response) => {

    await productModel.findById(request.body.id)
        .populate('parent_category_ids', 'name') // fetch name from referenced table using id --> mentioned ids in model, display property
        .populate('sub_category_ids', 'name') // reference already mentioned in model
        .populate('sub_sub_category_ids', 'name')
        .populate('material_ids', 'name')
        .populate('color_ids', 'name')
        .then((result) => {
            if (result) {
                const output = {
                    _status: true,
                    _message: 'Record Found!',
                    _image_path: process.env.product_image,
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



    const productId = request.params.id;

    const existingProduct = await productModel.findById(productId);

    if (!existingProduct) {
        return response.send({
            _status: false,
            _message: 'Product not found!',
            _data: null
        });
    }

    const saveData = request.body;


    // process.env.product_image



    // -------------------------------
    // Handle images
    // -------------------------------
    if (request.files) {
        // FRONT IMAGE
        if (request.files.front_image) {
            // delete old file if exists
            if (existingProduct.front_image) {
                const oldPath = path.join(process.env.product_image, existingProduct.front_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath)
                }
            }
            saveData.front_image = request.files.front_image[0].filename;
        }

        // BACK IMAGE
        if (request.files.back_image) {
            if (existingProduct.back_image) {
                const oldPath = path.join(process.env.product_image, existingProduct.back_image);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath)
                }
            }
            saveData.back_image = request.files.back_image[0].filename;
        }

        // IMAGE GALLERY (replace entire array)
        if (request.files.image_gallery) {
            // delete old gallery images
            if (Array.isArray(existingProduct.image_gallery)) {
                existingProduct.image_gallery.forEach(img => {
                    const oldPath = path.join(process.env.product_image, img);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath)
                    }
                });
            }
            saveData.image_gallery = request.files.image_gallery.map(file => file.filename);
        }
    }

    // -------------------------------
    // Update slug if name changed
    // -------------------------------
    if (saveData.name && saveData.name !== existingProduct.name) {
        const slug = slugify(saveData.name, { lower: true, strict: true });
        saveData.slug = await generateUniqueSlug(productModel, slug);
    }

    saveData.updated_at = Date.now();




    await productModel.updateOne({
        _id: request.params.id
    }, {
        // $set: request.body
        $set: saveData
    })
        .then(async (result) => {





            // after product is created then update product id in category, sub-category, sub-sub-category table for show products in category wise in website
            if (request.body.parent_category_ids != undefined && request.body.parent_category_ids != '') {
                await categoryModel.updateMany({
                    _id: request.body.parent_category_ids
                }, {
                    $push: {
                        product_ids: {
                            $each: [result._id]
                        }
                    }
                })
            }
            if (request.body.sub_category_ids != undefined && request.body.sub_category_ids != '') {
                await subCategoryModel.updateMany({
                    _id: request.body.sub_category_ids
                }, {
                    $push: {
                        product_ids: {
                            $each: [result._id]
                        }
                    }
                })
            }
            if (request.body.sub_sub_category_ids != undefined && request.body.sub_sub_category_ids != '') {
                await subSubCategoryModel.updateMany({
                    _id: request.body.sub_sub_category_ids
                }, {
                    $push: {
                        product_ids: {
                            $each: [result._id]
                        }
                    }
                })
            }
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////






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
        const products = await productModel.find({ _id: { $in: ids } });

        // if id is received but those ids are invalid
        if (!products.length) {
            return response.send({
                _status: false,
                _message: 'No matching products found',
                _data: null
            });
        }

        // update status of those ids one by one
        const updatePromises = products.map(product =>
            productModel.updateOne({
                _id: product._id
            }, {
                $set: {
                    status: !product.status
                }
            })
        );

        // waits for all the asynchronous update operations to complete before moving forward
        await Promise.all(updatePromises);

        return response.send({
            _status: true,
            _message: 'Status changed successfully!',
            _data: products.map(prodt => ({ id: prodt._id, previous_status: prodt.status, new_status: !prodt.status }))
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

    await productModel.updateMany({
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