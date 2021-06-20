const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @desc      Get courses
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public
exports.getCourses = asyncHandler(async (request, response, next) => {
    // When getting courses for a specific bootcamp we will not need pagination
    if (request.params.bootcampId) {
        const courses = await Course.find({ bootcamp: request.params.bootcampId });

        return response.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
       response.status(200).json(response.advancedResults); 
    }
});

// @desc      GET Course
// @route     GET /api/v1/courses/:id
// @access    Private
exports.getCourse = asyncHandler(async (request, response, next) => {
    const course = await Course.findById(request.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${request.params.id}`), 404);
    } 

    response.status(200).json({
        success: true,
        count: course.length,
        data: course
    })
});

// @desc      Add Course
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Private
exports.addCourse = asyncHandler(async (request, response, next) => {
    request.body.bootcamp = request.params.bootcampId;
    request.body.user = request.user.id
    
    const bootcamp = await Bootcamp.findById(request.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No course with the id of ${request.params.bootcampId}`), 404);
    } 

    // Make sure only bootcamp owner can add course
    if (bootcamp.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 
            401)
        );
    }

    const course = await Course.create(request.body);

    response.status(200).json({
        success: true,
        data: course
    })
});

// @desc      Update Course
// @route     GET /api/v1/courses/:id
// @access    Private
exports.updateCourse = asyncHandler(async (request, response, next) => {
    let course = await Course.findById(request.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${request.params.id}`), 404);
    } 

    // Make sure user is course owner  
    if (course.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.user.id} is not authorized to update course ${course._id}`, 
            401)
        );
    }

    course = await Course.findByIdAndUpdate(request.params.id, request.body, {
        new: true,
        runValidators: true
    });

    response.status(200).json({
        success: true,
        data: course
    })
});

// @desc      Delete Course
// @route     DELETE /api/v1/courses/:id
// @access    Private
exports.deleteCourse = asyncHandler(async (request, response, next) => {
    const course = await Course.findById(request.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with the id of ${request.params.id}`), 404);
    } 

    // Make sure only bootcamps owner can update them
    if (bootcamp.user.toString() !== request.user.id && request.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${request.user.id} is not authorized to delete this course ${course._id}`, 
            401)
        );
    }

    await Course.deleteOne(course);

    response.status(200).json({
        success: true,
        data: `${request.params.id} was successfully deleted`
    })
});  