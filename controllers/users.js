const User = require('../models/Users');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all Users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (request, response, next) => {
    response.status(200).json(response.advancedResults);
});

// @desc    Get Single User
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.params.id);

    response.status(200).json({
        success: true,
        data: user
    })
});

// @desc    Create User
// @route   POST /api/v1/auth/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (request, response, next) => {
    const user = await User.create(request.body);

    response.status(201).json({
        success: true,
        data: user
    })
});

// @desc    Update User
// @route   PUT /api/v1/auth/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (request, response, next) => {
    const user = await User.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true
    });

    response.status(200).json({
        success: true,
        data: user
    })
});

// @desc    Delete User
// @route   DELETE /api/v1/auth/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (request, response, next) => {
    await User.findByIdAndDelete(request.params.id);

    response.status(200).json({
        success: true,
        data: `User with ${request.params.id} deleted`
    })
});