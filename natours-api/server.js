const dotenv = require('dotenv');
const mongoose = require('mongoose');

// when there is an uncaught exception you need to crash you app because after there's an uncaught exception the entire node process is in an 'unclean state'. To fix that the process needs to be terminated and then restarted. In production, there should be a tool in place to restart after crashing. You must place this handler before any other code that gets executed
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION... SHUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful'));

// for local database connection
// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => console.log('Local DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App running on port ${port}`)
);

// This is how you handle unhandled rejected promises. we are listening to the 'unhandledRejection' event which then allows us to handle all the errors that occur in asynchronous code which were not previously handled
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLER REJECTION.. SHUTING DOWN...');
  // process.exit() is a very ubrupt way of ending the program because it'll immediately abort all the requests that are currently still running or pending, so you should shut down gracefully by using server.close() and pass in process.exit(). server.close() will close the server, then process.exit() will shut down the app. By using server.close(), you're giving the server time to finish all the requests that are still pending or are being handled at the time. Only after that, the server is killed. Usually in a production app on a web server, you'll usually have some tooling in place that restarts the app right after it crashes. Some platforms that host node.js apps will automatically do that on their own
  server.close(() => {
    // after the server gets closed down this callback will be called and process.exit() will shut down the app
    process.exit(1);
  });
});
