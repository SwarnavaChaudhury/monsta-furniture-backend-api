// all functions will declared here

const countryModel = require("../../models/Country");

exports.create = async (request, response) => {

    try {

        const insertData = new countryModel(request.body);

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
            _message: 'Country validation failed!',
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
    let totalRecords = await countryModel.find(filter).countDocuments();
    let total_pages = Math.ceil(totalRecords / limit);







    await countryModel.find(filter)
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

    await countryModel.findById(request.body.id)
        .then((result) => {
            if (result) {
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

exports.update = async (request, response) => {

    await countryModel.updateOne({
        _id: request.params.id
    }, {
        $set: request.body
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
        const countries = await countryModel.find({ _id: { $in: ids } });

        // if id is received but those ids are invalid
        if (!countries.length) {
            return response.send({
                _status: false,
                _message: 'No matching countries found',
                _data: null
            });
        }

        // update status of those ids one by one
        const updatePromises = countries.map(cntry =>
            countryModel.updateOne({
                _id: cntry._id
            }, {
                $set: {
                    status: !cntry.status
                }
            })
        );

        // waits for all the asynchronous update operations to complete before moving forward
        await Promise.all(updatePromises);

        return response.send({
            _status: true,
            _message: 'Status changed successfully!',
            _data: countries.map(cntry => ({ id: cntry._id, previous_status: cntry.status, new_status: !cntry.status }))
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

// exports.changeStatus = async (request, response) => {

//     await countryModel.updateMany({
//         _id: {
//             $in : request.body.id
//         }
//     }, {
//         $set: {
//             status : {
//                 $not : "$status"
//             }
//         }
//     })
//         .then((result) => {
//             const output = {
//                 _status: true,
//                 _message: 'Change status successfully!',
//                 _data: result
//             }
//             response.send(output);
//         })
//         .catch(() => {
//             const output = {
//                 _status: false,
//                 _message: 'Something went wrong!',
//                 _data: null
//             }
//             response.send(output);
//         })

// }

exports.destroy = async (request, response) => {

    await countryModel.updateMany({
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