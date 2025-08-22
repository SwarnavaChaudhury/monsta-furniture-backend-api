const mongoose = require('mongoose');

const subSubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        match: /^[a-zA-Z0-9\- ]{2,30}$/,
        // minLength: [3, 'Minimum length must be 3 character'],
        // maxLength: [15, 'Maximum length must be 15 character'],
    },
    parent_category_id: {
        // type: String,
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Parent Category is required'],
        ref: 'categories', // add reference parent table name
    },
    child_category_id: {
        // type: String,
        type: mongoose.Schema.Types.ObjectId,
        // But in Mongoose, if we want to use population (.populate()), should be store them as ObjectId
        required: [true, 'Child Category is required'],
        ref: 'sub_categories', // add reference parent table name
    },
    product_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            default: [],
        }
    ],
    image: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 0,
        min: [0, 'Minimum value must be greater than 0'],
        max: [1000, 'Maximum value must be less than 1000'],
    },
    status: {
        type: Boolean,
        default: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
    updated_at: {
        type: Date,
        default: Date.now(),
    },
    deleted_at: {
        type: Date,
        default: null,
    },
});

const subSubCategoryModel = mongoose.model('sub_sub_categories', subSubCategorySchema);

module.exports = subSubCategoryModel;