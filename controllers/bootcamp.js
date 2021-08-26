const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    get all bootcamps
// @route   /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (request, response, next) => {
    // Get bootcamp is access through a route that uses the advance result
    response
    .status(200)
    .json(response.advancedResults);   
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
    // Add user to request.body
    request.body.user = request.user.id

    // Check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: request.user.id })

    // If the user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && request.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${request.user.id} has already published a bootcamp`, 400));
    }
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
    let bootcamp = await Bootcamp.findById(request.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }

    // Make sure only bootcamps owner can update them
    if (bootcamp.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.params.id} is not authorized to update this bootcamp`, 
            401)
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true
    })
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
    // Inorder to delete a bootcamp and their respective courses
    // We will not use findbyidandDelete, rather we will find the
    // Bootcamp and then delete it.
    const bootcamp = await Bootcamp.findById(request.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }

    // Make sure only bootcamps owner can update them
    if (bootcamp.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.params.id} is not authorized to delete this bootcamp`, 
            401)
        );
    }

    bootcamp.remove();
    response
        .status(200)
        .json({ 
            success: 'true', 
            data: `bootcamp ${request.params.id} deleted`
        });
    
})


// @desc    Get bootcamps within radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampInRadius = asyncHandler(async (request, response, next) => {
    const { zipcode, distance } = request.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode)
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radius
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat], radius ]}}
    })

    response.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (request, response, next) => {
    const bootcamp = await Bootcamp.findById(request.params.id);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${request.params.id}`, 404)
        );
    }

    console.log(request.user.role);
    // Make sure only bootcamps owner can update them
    if (bootcamp.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.params.id} is not authorized to delete this bootcamp`, 
            401)
        );
    }

    if (!request.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }
    
    const file = request.files.file;

    // Make sure image is a photo
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image file', 400));
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(request.params.id, { photo: file.name });

        response.status(200).json({
            success: true,
            data: file.name
        })
    })
    console.log(file.name);
})
