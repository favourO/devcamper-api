const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    get all bootcamps
// @route   /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.find();
        
    response
    .status(200)
    .json({ 
        success: 'true', 
        count: bootcamp.length,
        data: bootcamp
    });   
})

// @desc    get a single bootcamp
// @route   /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findById(request.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }
    response
    .status(200)
    .json({ 
        success: 'true', 
        count: bootcamp.length,
        data: bootcamp
    });
    }

)

// @desc    create a single bootcamp
// @route   /api/v1/bootcamps
// @access  Public
exports.createBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.create(request.body);

    response.status(201).json({
        status: 'success',
        count: bootcamp.length,
        data: bootcamp
    })
    
})

// @desc    update a single bootcamp
// @route   /api/v1/bootcamps/:id
// @access  Public
exports.updateBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }
    response
        .status(200)
        .json({ 
            success: 'true', 
            data: bootcamp
        });

})

// @desc    delete a single bootcamp
// @route   /api/v1/bootcamps/:id
// @access  Public
exports.deleteBootcamp = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(request.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }
    response
        .status(200)
        .json({ 
            success: 'true', 
            data: `bootcamp ${request.params.id} deleted`
        });
    
})