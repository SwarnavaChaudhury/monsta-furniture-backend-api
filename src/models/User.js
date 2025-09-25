const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        match: /^[a-zA-Z0-9\- ]{2,30}$/,
    },
    email : {
        type: String,
        required: [true, 'Email is required'],
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        validate: {
            validator: async function (v) {
                const email = await this.constructor.findOne({ email: v, deleted_at: '' });
                return !email;
            },
            message: props => `The specified email is already in use.`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        maxlength: [60, 'Password must be at most 60 characters long'],
    },
    mobile_number: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: /^[0-9]{8,15}$/,
        // validate: {
        //     validator: async function (v) {
        //         const mobile = await this.constructor.findOne({ mobile_number: v, deleted_at: '' });
        //         return !mobile;
        //     },
        //     message: props => `The specified mobile number is already in use.`
        // }
    },
    gender: {
        type: String,
        required: [false, 'Gender is required'],
        enum: ['Mr', 'Mrs'],
        default: '',
    },
    address: {
        type: String,
        required: [false, 'Address is required'],
        maxlength: [4000, 'Address must be at most 4000 characters long'],
        default: '',
    },
    role_type: {
        type: String,
        required: [true, 'Type is required'],
        enum: ['Admin', 'User'],
        default: 'User'
    },
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
        default: '',
    },
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;