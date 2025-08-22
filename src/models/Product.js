const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        match: /^[a-zA-Z0-9\- ]{2,30}$/,
        // minLength: [3, 'Minimum length must be 3 character'],
        // maxLength: [15, 'Maximum length must be 15 character'],
        // validate: {
        //     validator: async function (v) {
        //         const name = await this.constructor.findOne({ name: v });
        //         return !name;
        //     },
        //     message: props => `The specified name is already in use.`
        // }
    },




    front_image: {
        type: String,
        default: '',
    },
    back_image: {
        type: String,
        default: '',
    },
    image_gallery: {
        type: Array, // Array of strings to store multiple image URLs
        default: [],
    },





    slug: {
        type: String,
        unique: true,
        trim: true,
        default: '',
    },
    actual_price: {
        type: Number,
        required: [true, 'Actual price is required'],
        min: [0, 'Minimum value must be greater than 0'],
        max: [100000, 'Maximum value must be less than 100000'],
    },
    selling_price: {
        type: Number,
        required: [true, 'Selling price is required'],
        min: [0, 'Minimum value must be greater than 0'],
        max: [100000, 'Maximum value must be less than 100000'],
    },
    parent_category_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categories',
            // required: [true, 'Parent category is required'],
            default: [],
        }
    ],
    sub_category_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sub_categories',
            // required: [true, 'Sub category is required'],
            default: [],
        }
    ],
    sub_sub_category_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sub_sub_categories',
            // required: [true, 'Sub sub-category is required'],
            default: [],
        }
    ],

    // product_type: {
    //     type: Number,
    //     required: [true, 'Product type is required'],
    //     enum: [1, 2], // 1 - Featured, 2 - New Arrival, 3 - On Sale
    //     default: 1, // Default to Featured
    // },

    is_featured: {
        type: Boolean,
        default: false,
    },
    is_new_arrival: {
        type: Boolean,
        default: false,
    },
    is_on_sale: {
        type: Boolean,
        default: false,
    },




    is_best_selling: {
        type: Boolean,
        default: false,
    },
    is_upsale: {
        type: Boolean,
        default: false,
    },




    material_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'materials',
            // required: [true, 'Material is required'],
            default: [],
        }
    ],
    color_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'colors',
            // required: [true, 'Color is required'],
            default: [],
        }
    ],



    short_description: {
        type: String,
        required: [true, 'Short description is required'],
        match: /^[a-zA-Z0-9\-., ]{10,100}$/,
        // minLength: [10, 'Minimum length must be 10 character'],
        // maxLength: [100, 'Maximum length must be 100 character'],
        default: '',
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        match: /^[a-zA-Z0-9\-., ]{10,500}$/,
        // minLength: [10, 'Minimum length must be 10 character'],
        // maxLength: [500, 'Maximum length must be 500 character'],
        default: '',
    },




    product_code: {
        type: String,
        // required: [true, 'Product code is required'],
        match: /^[a-zA-Z0-9\-]{3,20}$/,
        minlength: [3, 'Minimum length must be 3 character'],
        maxlength: [20, 'Maximum length must be 20 character'],
        default: '',
    },
    stock: {
        type: Number,
        // required: [true, 'Stock is required'],
        min: [0, 'Minimum value must be greater than 0'],
        max: [10000, 'Maximum value must be less than 10000'],
        default: 0,
    },
    product_dimensions: {
        type: String,
        // required: [true, 'Product dimensions is required'],
        minlength: [5, 'Minimum length must be 5 character'],
        maxlength: [15, 'Maximum length must be 15 character'],
        default: '',
    },
    product_delivery_days: {
        type: Number,
        // required: [true, 'Product delivery days is required'],
        min: [1, 'Minimum value must be greater than 0'],
        max: [30, 'Maximum value must be less than 30'],
        default: 7,
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
        default: '',
    },
});

const productModel = mongoose.model('products', productSchema);

module.exports = productModel;