// all functions will declared here
require('dotenv').config()

const userModal = require('../../models/User');

const nodemailer = require("nodemailer");



const fs = require('fs');
const path = require('path');

var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { decode } = require('punycode');
const saltRounds = 10;



// Register API
exports.register = async (request, response) => {

    var existingUser = await userModal.findOne({ email: request.body.email, deleted_at: '', role_type: 'Admin' });

    if (existingUser) {
        const output = {
            _status: false,
            _message: 'The specified email is already in use.',
            _data: null
        }

        return response.status(400).send(output);
    }

    const newUser = {
        name: request.body.name,
        email: request.body.email,
        password: await bcrypt.hash(request.body.password, saltRounds),
        mobile_number: request.body.mobile_number,
        role_type: 'Admin'
    }

    console.log(newUser);

    try {

        const insertData = new userModal(newUser);

        await insertData.save()
            .then((result) => {

                var token = jwt.sign({ userData: result }, process.env.KEY_VALUE);

                const output = {
                    _status: true,
                    _message: 'User Registered Successfully!',
                    _token: token,
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
            _message: 'User validation failed!',
            _data: null
        }
        response.send(output);
    }

}


// Login API
exports.login = async (request, response) => {

    var existingUser = await userModal.findOne({ email: request.body.email, deleted_at: '', role_type: 'Admin' });

    // 1. check user email
    if (!existingUser) {
        const output = {
            _status: false,
            _message: 'Invalid email id!',
            _data: null
        }
        return response.status(400).send(output);
    }

    // 2. check user status
    var userStatus = existingUser.status;

    if (!userStatus) {
        const output = {
            _status: false,
            _message: 'Your account has been deactivated by admin. Please contact admin.',
            _data: null
        }
        return response.status(400).send(output);
    }


    // 3. check user password
    if (await bcrypt.compare(request.body.password, existingUser.password)) {

        var token = jwt.sign({ userData: existingUser }, process.env.KEY_VALUE);

        const output = {
            _status: true,
            _message: 'Admin Logged in Successfully!',
            _token: token,
            _data: existingUser
        }
        return response.send(output);

    } else {

        const output = {
            _status: false,
            _message: 'Invalid password!',
            _data: null
        }
        return response.status(400).send(output);

    }

}


// view profile API
exports.viewProfile = async (request, response) => {


    // console.log(request.headers);
    // console.log(request.headers.authorization);

    var token = request.headers.authorization;

    if (!token) {
        return response.send({
            _status: false,
            _message: 'No token provided',
            _data: null
        });
    }

    var token = token.split(" ")[1];  // remove Bearer prefix if present
    // console.log(token);

    try {

        var decoded = jwt.verify(token, process.env.KEY_VALUE);
        // console.log(decoded);

        // var userData = await user.findById(decoded.userData._id).select('-password -__v -createdAt -updatedAt -deleted_at');
        // var userData = await userModal.findById(decoded.userData._id);
        var userData = await userModal.findOne({ _id: decoded.userData._id, role_type: 'Admin' });

        if (!userData) {
            return response.send({
                _status: false,
                _message: 'User not found',
                _data: null,
            });
        }

        const output = {
            _status: true,
            _message: 'Profile fetched successfully',
            _data: userData
        };

        response.send(output);

    }
    catch (error) {

        return response.send({
            _status: false,
            _message: 'Failed to authenticate token',
            _data: null
        });

    }

}


// update profile API
exports.updateProfile = async (request, response) => {

    // console.log(request.headers);
    // console.log(request.headers.authorization);

    var token = request.headers.authorization;

    if (!token) {
        return response.send({
            _status: false,
            _message: 'No token provided',
            _data: null
        });
    }

    var token = token.split(" ")[1];  // remove Bearer prefix if present
    // console.log(token);

    try {
        var decoded = jwt.verify(token, process.env.KEY_VALUE);

        // var userData = await userModal.findById(decoded.userData._id);
        var userData = await userModal.findOne({ _id: decoded.userData._id, role_type: 'Admin' });

        if (!userData) {
            return response.send({
                _status: false,
                _message: 'User not found!',
                _data: null
            });
        }

        // userData.name = request.body.name || userData.name;
        // userData.email = request.body.email || userData.email;
        // userData.mobile_number = request.body.mobile_number || userData.mobile_number;

        const updateData = request.body;

        if (request.file) {
            // updateData.image = request.file.filename;
            const newFilename = request.file.filename;

            // Determine uploads directory (where multer saved user images)
            // Using a direct path under project root:
            const uploadsDir = path.join(process.cwd(), 'uploads', 'users');

            if (userData.image) {
                const oldImagePath = path.join(uploadsDir, userData.image);
                try {
                    // check if file exists and delete
                    if (fs.existsSync(oldImagePath)) {
                        await fs.promises.unlink(oldImagePath);
                        // console.log('Old profile image deleted:', oldImagePath);
                    }
                } catch (err) {
                    // Log the error but don't fail the whole request
                    console.error('Failed to delete old profile image:', err);
                }
            }

            // Set the new filename into update payload
            updateData.image = newFilename;
        } else {

            // if no image is attached while update profile
            updateData.image = userData.image

        }

        // Update updated_at
        updateData.updated_at = Date.now();

        var userData = await userModal.updateOne(
            {
                _id: decoded.userData._id
            }, {
            $set: updateData
        }
        );

        const output = {
            _status: true,
            _message: 'Profile updated successfully',
            _data: userData,
        };

        return response.send(output);

    }
    catch (error) {

        return response.send({
            _status: false,
            _message: 'Failed to authenticate token',
            _data: null
        });

    }

}


// change password API
exports.changePassword = async (request, response) => {

    // console.log(request.headers);
    // console.log(request.headers.authorization);

    var token = request.headers.authorization;

    if (!token) {
        return response.send({
            _status: false,
            _message: 'No token provided',
            _data: null
        });
    }

    var token = token.split(" ")[1];  // remove Bearer prefix if present
    // console.log(token);

    try {
        var decoded = jwt.verify(token, process.env.KEY_VALUE);

        // var userData = await userModal.findById(decoded.userData._id);
        var userData = await userModal.findOne({ _id: decoded.userData._id, role_type: 'Admin' });

        if (!userData) {
            return response.send({
                _status: false,
                _message: 'User not found!',
                _data: null
            });
        }



        // condition 1: check current password
        var verifyPassword = await bcrypt.compare(request.body.current_password, userData.password);
        if (!verifyPassword) {

            return response.send({
                _status: false,
                _message: 'Current password is incorrect!',
                _data: null,
            });

        }

        // condition 2: current password not equal to new password
        if (request.body.current_password === request.body.new_password) {

            return response.send({
                _status: false,
                _message: 'New password can not be the same as current password!',
                _data: null,
            });

        }

        // condition 3: new password and confirm password is equal or not
        if (request.body.new_password != request.body.confirm_password) {

            return response.send({
                _status: false,
                _message: 'New password and confirm password do not match!',
                _data: null,
            });

        }


        var updated_password = await bcrypt.hash(request.body.new_password, saltRounds);


        var userData = await userModal.updateOne(
            {
                _id: decoded.userData._id
            },
            {
                password: updated_password
            }
        );

        const output = {
            _status: true,
            _message: 'Password change successfully!',
            _data: userData,
        };

        return response.send(output);

    }
    catch (error) {

        return response.send({
            _status: false,
            _message: 'Failed to authenticate token',
            _data: null
        });

    }


}


// Forgot Password API
exports.forgotPassword = async (request, response) => {

    var existingUser = await userModal.findOne({ email: request.body.email, deleted_at: '', role_type: 'Admin' });
    if (!existingUser) {
        return response.send({
            _status: false,
            _message: 'Email not found!',
            _data: null,
        });
    }

    // Generate a random token
    var token = jwt.sign({ userData: existingUser }, process.env.KEY_VALUE, {
        expiresIn: '1h' // Token valid for 1 Hour
    });


    // email setup

    // 1. Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. Email Options
    const mainOptions = await transporter.sendMail({
        from: 'Node Ecom Project <' + process.env.EMAIL_USER + '>', // Sender Email Address
        to: existingUser.email, // Recipient Address [Comma Seperated]
        subject: "Password Reset Request",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                <h2>Password Reset Request</h2>
                <p>Hello ${existingUser.name || 'User'},</p>
                <p>We received a request to reset your password. Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="http://localhost:3000/reset-password?token=${token}" 
                       style="background: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Thank you,<br/>Monsta Furniture Team</p>
            </div>
        `,
    });

    // 3. Send the email
    await transporter.sendMail(mainOptions, function (error, info) {
        if (error) {
            return response.send({
                _status: false,
                _message: 'Error sending email',
                _data: null
            });
        } else {
            return response.send({
                _status: true,
                _message: 'Password reset email sent successfully',
                _data: null
            });
        }
    });

}


// Reset password API
exports.resetPassword = async ( request, response ) => {

    
    // console.log(request.headers);
    // console.log(request.headers.authorization);

    var token = request.headers.authorization;

    if (!token) {
        return response.send({
            _status: false,
            _message: 'No token provided',
            _data: null
        });
    }

    var token = token.split(" ")[1];  // remove Bearer prefix if present
    // console.log(token);

    try {
        var decoded = jwt.verify(token, process.env.KEY_VALUE);

        // var userData = await userModal.findById(decoded.userData._id);
        var userData = await userModal.findOne({ _id: decoded.userData._id, role_type: 'Admin' });

        if (!userData) {
            return response.send({
                _status: false,
                _message: 'Admin not found!',
                _data: null
            });
        }


        // condition: new password and confirm password is equal or not
        if (request.body.new_password != request.body.confirm_password) {

            return response.send({
                _status: false,
                _message: 'New password and confirm password do not match!',
                _data: null,
            });

        }


        var updated_password = await bcrypt.hash(request.body.new_password, saltRounds);


        var userData = await userModal.updateOne(
            {
                _id: decoded.userData._id
            },
            {
                password: updated_password
            }
        );

        const output = {
            _status: true,
            _message: 'Reset password successfully!',
            _data: userData,
        };

        return response.send(output);

    }
    catch (error) {

        return response.send({
            _status: false,
            _message: 'Failed to authenticate token',
            _data: null
        });

    }

}


























// exports.register = (request, response) => {

//     var token = jwt.sign({ userData: 'Welcome to WS' }, process.env.KEY_VALUE, {
//         expiresIn: 10000  // expires in 10 seconds
//     });


//     const output = {
//         _status: true,
//         _message: 'User registered successfully!',
//         _data: token
//     }

//     response.send(output);

// }

// exports.login = (request, response) => {

//     var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRGF0YSI6IldlbGNvbWUgdG8gV1MiLCJpYXQiOjE3NTYzODYzMTIsImV4cCI6MTc1NjM5NjMxMn0.QKtn7OHti10krcb5pLQSa6V4DOwVbID5xFSsa4hu3hQ';

//     var verify = jwt.verify(token, process.env.KEY_VALUE);



//     const output = {
//         _status: true,
//         _message: 'User Found!',
//         _data: verify
//     }

//     response.send(output);

// }