const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    get all bootcamps
// @route   /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (request, response, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...request.query };

    // Fields to exclude
    const removeFields = ['select', 'sort'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Bootcamp.find(JSON.parse(queryStr));

    // Select fields
    if (request.query.select) {
        const fields = request.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (request.query.sort) {
        const sortBy = request.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt'); 
    }
    // Executing query
    const bootcamp = await query;
    
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