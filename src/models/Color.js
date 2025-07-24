// schema will declared here
// for type / property etc.

const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        match: /^[a-zA-Z 0-9]{2,15}$/,
        // minLength: [3, 'Minimum length must be 3 character'],
        // maxLength: [15, 'Maximum length must be 15 character'],
        validate: {
            validator: async function (v) {
                const name = await this.constructor.findOne({ name: v });
                return !name;
            },
            message: props => `The specified name is already in use.`
        }
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
        default: '',
    },
    status: {
        type: Boolean,
        default: true,
    },
    order: {
        type: Number,
        default: 0,
        min: [0, 'Minimum value must be greater than 0'],
        max: [1000, 'Maximum value must be less than 1000'],
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

const colorModel = mongoose.model('colors', colorSchema);

module.exports = colorModel;