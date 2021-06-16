const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const cliProgress = require('cli-progress');

// Load env vars
dotenv.config({ path: './config/config.env'});

// Load models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');

// Progress Bar
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.legacy);


// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})

// Read JSON files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8')
)

const courses = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8')
)

// Import into DB
const importData = async () => {
    bar.start(5000, 0);
    for(var i = 0; i < 5000; i++) {
        bar.update(i);
    }
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        bar.stop();
        console.log('Data Imported...'.green.inverse);
        process.exit();

    } catch (err) {
        console.error(err);
    }
}

// Delete data
const deleteData = async () => {
    //bar.start(200000, 0);
    //bar.update(100000);
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        //bar.stop();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}



if (process.argv[2] === '-i') {
    importData()
}else if (process.argv[2] === '-d') {
    deleteData();
}