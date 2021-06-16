const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius } = require('../controllers/bootcamp');

// Include other resource routers
const coursRouter = require('./courseRoutes');

const router = express.Router();

// Re-route into other resource routers
// This routes re-routes from courses route file
// To get all courses associated with a single bootcamp
router.use('/:bootcampId/courses', coursRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;