const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 7000;
const corsOpts = {
    origin: '*',
	credentials: true, 
	
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
app.use(cors({credentials: true, origin: true}));
var cron = require('node-cron');
const request = require('request');
app.use(express.json());
// const feedbackRouter = require("./routes/feedbackRoute");
const emailRouter = require("./routes/emailRoute");
const pickerRouter = require("./routes/pickerRoute");
const dashboardRouter = require("./routes/dashboardRoute");
const outboundRouter = require("./routes/outboundRoute");
const inboundRouter = require("./routes/inboundRoute");
const userRouter = require("./routes/userRoute");
const scanRouter = require("./routes/scanRoute");

// const timeConfig = require('../config/frequency.config');



app.set('view engine', 'pug')

//added feedback operations router
// app.use("/feedback", feedbackRouter);
// For the time now
Date.prototype.timeNow = function() {
    return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":" + ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
}



//added email operations router
app.use("/email", emailRouter);
app.use("/picker", pickerRouter);
app.use("/dashboard", dashboardRouter);
app.use("/outbound", outboundRouter);
app.use("/inbound", inboundRouter);
app.use("/user", userRouter);
app.use("/scan", scanRouter);


cron.schedule(`0 */2 * * * *`, () => {
    console.log('running a task 5 minute minute');
    console.log(new Date().timeNow());
    request('http://localhost:7000/email/details', function(error, response, body) {
        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
    });
});

//cron job for bangalore automail........................
// cron.schedule(`0 37 15 * * *`, () => {
//     console.log('starting background automail task...........');
//     console.log(new Date().timeNow());
//     request('http://localhost:7000/email/autoMail?warehouseId=1100000001', function(error, response, body) {
//         console.error('error:', error); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log('body:', body); // Print the HTML for the Google homepage.
//     });
// });

//cron job for pune automail........................
// cron.schedule(`0 37 15 * * *`, () => {
//     console.log('starting background automail task...........');
//     console.log(new Date().timeNow());
//     request('http://localhost:7000/email/autoMail?warehouseId=1100000002', function(error, response, body) {
//         console.error('error:', error); // Print the error if one occurred
//         console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
//         console.log('body:', body); // Print the HTML for the Google homepage.
//     });
// });


app.listen(port, () => console.log(`The app is running on Port: ${port}.`));