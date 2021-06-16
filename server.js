const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const colors = require('colors');


// Load environment variables
dotenv.config({ path: './config/config.env'});

// Load database
connectDB();
// Load Route Files
const bootcampRoutes = require('./routes/bootcampRoutes');
const courseRoutes = require('./routes/courseRoutes');


//initialize express server

const app = express();

// Body Parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcampRoutes);
app.use('/api/v1/courses', courseRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening in ${process.env.NODE_ENV} on port ${PORT}!`.yellow.bold);
});


//this is used to handle unhandled rejections like database connection processes
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error - ${err.message}`.red.bold);
    // Close the server and exit process
    server.close(() => process.exit(1));
})