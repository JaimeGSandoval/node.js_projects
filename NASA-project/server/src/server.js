require('dotenv').config();
const http = require('http');
const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 3000;

// creating an express server by using the http core module in node and passing in app, which is an express server, gives more flexibility. Passing in app into create server will cause app to handle the requests. Any middleware and route handlers that you attach to app will respond to requests coming in to the server. The added benefit of this is that we can organize our code a little more by separating the server functionality we have in this file from our express code which is in app.js. Setting up the server this way using the http server allows you to respond to http requests and other types of connections like web sockets. One can use this technique for any scale of node application
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));
}

startServer();
