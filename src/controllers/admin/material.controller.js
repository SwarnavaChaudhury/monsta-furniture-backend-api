const colorModel = require("../../models/Color");
const materialModel = require("../../models/Material");

exports.create = async (request, response) => {

    try {

        const insertData = new materialModel(request.body);

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

        console.log(error);

        const output = {
            _status: false,
            _message: 'Material validation failed!',
            _data: null
        }
        response.send(output);

    }

}

exports.view = async (request, response) => {

    try {



        // full list view ---> search functionality
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
        }

        if (addCondition.length > 0) {
            var filter = { $and: addCondition }
        } else {
            var filter = {}
        }

        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        const current_page = Number(request?.body?.page) > 0 ? Number(request.body.page) : 1;
        const limit = Number(request?.body?.limit) || 5;

        const skip = (current_page - 1) * limit;


        // show total number of rows available in table
        let totalRecords = await materialModel.find(filter).countDocuments();

        let total_pages = Math.ceil(totalRecords / limit);







        await materialModel.find(filter)
            .skip(skip).limit(limit)
            .sort({
                order: 'asc'
            })
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
    catch (error) {

        const output = {
            _status: false,
            _message: 'Something went wrong!',
            _data: null
        }
        response.send(output);

    }

}

exports.details = async (request, response) => {

    await materialModel.findById(request.body.id)
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

    console.log(request.params.id);

    await materialModel.updateOne({
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
        .catch(() => {
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
        // const colors = await colorModel.find({ _id: { $in: ids } });
        const materials = await materialModel.find({ _id: { $in: ids } });

        // if id is received but those ids are invalid
        if (!materials.length) {
            return response.send({
                _status: false,
                _message: 'No matching materials found',
                _data: null
            });
        }

        // update status of those ids one by one
        const updatePromises = materials.map(material =>
            materialModel.updateOne({
                _id: material._id
            }, {
                $set: {
                    status: !material.status
                }
            })
        );

        // waits for all the asynchronous update operations to complete before moving forward
        await Promise.all(updatePromises);

        return response.send({
            _status: true,
            _message: 'Status changed successfully!',
            _data: materials.map(mtrls => ({ id: mtrls._id, previous_status: mtrls.status, new_status: !mtrls.status }))
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

    try {

        await materialModel.updateMany({
            _id: {
                $in: request.body.id
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

    } catch (error) {

        const output = {
            _status: false,
            _message: 'Something went wrong!',
            _data: null
        }
        response.send(output);

    }

}