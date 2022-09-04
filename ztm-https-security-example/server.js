const fs = require('fs');
const path = require('path');
const https = require('https');
const helmet = require('helmet');
const express = require('express');
const passport = require('passport');
const cookieSession = require('cookie-session');
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

// NOTE: to access the webpage and get past the browser security warning when it rejects the invalid cert for using self signed certificate with openssl, type thisisunsafe anywhere on the page and you'll gain access. You can check the headers in the network and see that your on https connection

const PORT = 3000;
// CLIENT_ID uniquely identifies out application to google's oauth servers
// CLIENT_SECRET is what's used to make sure that only our application with this secret will be able to grant authorization. This value must be kept secure and never shared and only stored on our server in the .env file. It is sent with the authorization code that's sent to us by google to create an access token/jwt

const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};
// passport strategy determines how passport authenticates users
// you must set the passport strategy before the middleware chain
// passport will us go through the oauth flow so we don't have to keep track of all the requests to the google server and how we respond to them
// our google oauth strategy needs to know the callback/redirect url so that it can send that to google which will then know which end point in our server google needs to send the authorization code to
const AUTH_OPTIONS = {
  callbackURL: '/auth/google/callback',
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

// if you're using a database you can use the verifyCallback func to save the user that's come back as well as any of their profile info into our DB so that it's available in the rest of the app.
// the verifyCallback func is responsible for wrapping up the authentication process.
// We can use the access token to access Google services and APIs with our logged in account?
function verifyCallback(accessToken, refreshToken, profile, done) {
  // the profile being logged is what's being serialized and deserialized from our cookie. it's what we see in the browser Set-Cookie header for the callback uri from google. the secure flag will be set to httpOnly automatically so we can't access this cookie from javascript
  console.log('Google profile', profile);
  // if the credentials that were passed, .i.e. accessToken and refreshToken are valid, we call done() to supply with the user that authenticated. If something goes wrong or the credentials are invalid we can pass in an error as the first argument and the second arg is the user data/profile for the successfully authenticated user. When we pass profile as the second parameter passport now knows that the user is logged in
  done(null, profile);
}

// the second argument is the verify function that's called when passport authenticates the user. When we're authenticating a request to our api passport parses the user credentials contained in the request and it then calls the verify function with those credentials as arguments. Because we're using oauth, the credentials for the user include the access token and optionally the refresh token
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

// save the session to the cookie
// taking the profile as it comes in from google and setting that as the session in our cookie
// the serializedUser takes the google profile, the one that we get in our verifyCallback(), and it will create that first cookie for our session
passport.serializeUser((user, done) => {
  done(null, user.id); // sets the value of user to the cookie
});

// the callback passed into deserialize takes i and object from our session and returns back the data that will be made available inside of express on the req.user property. This callback also takes a done function. You pass in an error to done for the first argument and the second is going to be the result which is whatever is coming in with our cookie is going to be what's populated on our req.user object in express
// read the session from the cookie
// read the profile back whenever cookie is sent to our api from a browser
passport.deserializeUser((id, done) => {
  // example of looking up the user in a DB. the id parameter would be passed into deserializedUser instead of obj
  //User.findById(id).then(user => {
  // done(null, user)
  //})
  done(null, id);
});
const app = express();

// call helmet at the top of the middleware chain before any routes so that every request passes through the helmet middleware
app.use(helmet());

// the session needs to be set up before passport uses it but we want helmet to check our headers before we do anything with the session.
// hours * minutes * seconds * milliseconds
app.use(
  cookieSession({
    name: 'session',
    maxAge: 24 * 60 * 60 * 1000, // session is valid for 24 hours
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
  })
);

// always place passport at the top of the middleware stack after helmet
app.use(passport.initialize());

// this middleware is so that passport understands our cookie session and the req.user object that's set by the cookie session middleware. This will authenticate the session that's being sent to our server. it uses these keys and validates that everything is signed as it should be. It then sets the value of the user property on our request object to contain the user's identity. i.e. the passport.session() middleware will allow the deserializedUser function to be called, which in turn sets req.user which we can use in any of our express middleware
app.use(passport.session());

// function to restrict access to certain endpoints by checking if the user is logged in
function checkedLoggedIn(req, res, next) {
  // this will log out CURRENT USER IS: 100078022450330778426
  console.log('CURRENT USER IS:', req.user);
  const isLoggedIn = req.isAuthenticated() && req.user;
  if (!isLoggedIn) {
    return res.status(401).json({
      error: 'You must log in',
    });
  }

  next();
}

// OAUTH PROCESS

// think from a higher level about which endpoints you'll need and work you way down

// google login endpoint to authenticate user
// to start the entire authentication process the user clicks to log in and we're taken to /auth/google which will start the entire oauth flow. We use passport.authenticate middleware for the first step. In the options object we specify what we want the scope to be. The scope specifies which data we're requesting from google when everything succeeds .i.e email , profile, etc. Any data that we need to fill out our user's info in a DB
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email'],
  })
);

// when we registered our application with google, we specified that there would be GET endpoint under /auth/google/callback aka the redirect uri
// the callback url is what specifies the redirect from the google authorization server when it sends back the authorization code which is what use to get back that access token that we use in all of our requests to gain access to restricted data in our application. The callback url where google will send this authorization code lives in our backend api . It is also where google will redirect the browser once the user has authenticated .i.e. logged in and consented
// the passport.authenticated middleware will handle the flow from when google sends us the authorization code response, the request sent back to google to get the access token, as well as google's response to that request.
// so authorization code response, send authorization code + client secret to /token and Access token (and optionally refresh token)
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true, // to save the session when the user logs in and serialize it in a cookie we need to set this session property to true or leave it out because its default value is true
  }),
  (req, res) => {
    // the third arg to passport.authenticate is a request handler that allows us to do something optional if necessary
    console.log('Google called us back');
  }
);

// this is how to restrict access to our apis. this is how we do authorization. by placing middleware like checkLoggedIn to run before check if the user is logged in, or had permission to access the endpoint, etc
app.get('/secret', checkedLoggedIn, (req, res) => {
  res.send('Your personal secret is 42');
});

app.get('/failure', (req, res) => {
  return res.send('Failed to log in');
});

// logout endpoint
app.get('/auth/logout', (req, res) => {
  req.logout(); // removes req.user and clears any logged in session
  return res.redirect('/');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// use fs.readFileSync to read key.pem and cert.pem files first before passing them as options to our createServer function
https
  .createServer(
    {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },
    app
  )
  .listen(PORT, () => console.log(`Listening on port ${PORT}...`));
