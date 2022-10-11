const express = require('express');

const app = express();

// Step 1: Import the libraries into your file

//Import the main Passport and Express-Session library
const session = require('express-session');
const passport = require('passport');

//Import the secondary "Strategy" library
const LocalStrategy = require('passport-local').Strategy;
app.use(express.urlencoded({ extended: false }));

// Step 2: Initialize Middleware

// This is the basic express session({..}) initialization.
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

// init passport on every route call.
app.use(passport.initialize());

// allow passport to use "express-session".
app.use(passport.session());

// Step 3: Use Passport to define the Authentication Strategy

// Define the “authUser” function to get authenticated Users
// The “authUser” function is a callback function that is required within the LocalStrategy, and can takes three arguments.
// The “user” and “password” are populated from the “req.body.username” and “req.body.password”. These can be used to search the DB to find and authenticate the username/password that was entered in the “login” form.
// The “done()” function is then used to pass the “{authenticated_user}” to the serializeUser() function.

// Note, the done(<err>, <user>) function in the “authUser” is passed as ,

// 1. If the user not found in DB,
// done (null, false)
// 2. If the user found in DB, but password does not match,
// done (null, false)
// 3. If user found in DB and password match,
// done (null, {authenticated_user})
// i.e.

// if user not found,
// done( <no error> so null, <no matching user> so false),
// if user found but password does not match,
// done ( <no error> so null, <no matching user> so false)
// if user found and password matches, we found our authenticated user and done ( <no error> so null, <pass authenticated user to serializeUser()>)

const authUser = (user, password, done) => {
  //Search the user, password in the DB to authenticate the user

  console.log(`Value of "User" in authUser function ----> ${user}`); //passport will populate, user = req.body.username
  console.log(`Value of "Password" in authUser function ----> ${password}`); //passport will popuplate, password = req.body.password

  //Let's assume that a search within your DB returned the username and password match for "Kyle".

  let authenticated_user = {
    id: 123,
    name: 'Kyle',
  };

  return done(null, authenticated_user);
};

app.use(new LocalStrategy(authUser));

// Step 4: Serialize and De-Serialize (authenticated) users

// SERIALIZE USER
// WHAT DOES SERIALIZE USER MEAN?
// 1. "express-session" creates a "req.session" object, when it is invoked via app.use(session({..}))
// 2. "passport" then adds an additional object "req.session.passport" to this "req.session".
// 3. All the serializeUser() function does is,
// receives the "authenticated user" object from the "Strategy" framework, and attach the authenticated user to "req.session.passport.user.{..}"
// In above case we receive {id: 123, name: "Kyle"} from the done() in the authUser function in the Strategy framework,
// so this will be attached as
// req.session.passport.user.{id: 123, name: "Kyle"}

// 3. So in effect during "serializeUser", the PassportJS library adds the authenticated user to end of the "req.session.passport" object.
// This is what is meant by serialization.
// This allows the authenticated user to be "attached" to a unique session.
// This is why PassportJS library is used, as it abstracts this away and directly maintains authenticated users for each session within the "req.session.passport.user.{..}"

passport.serializeUser((userObj, done) => {
  done(null, userObj);
});

// DESERIALIZE USER
// Now anytime we want the user details for a session, we can simply get the object that is stored in “req.session.passport.user.{..}”.

// We can extract the user information from the {..} object and perform additional search our database for that user to get additional user information, or to simply display the user name on a dashboard.

// WHAT DOES DESERIALIZE USER MEAN?
// 1. Passport JS conveniently populates the "userObj" value in the deserializeUser() with the object attached at the end of "req.session.passport.user.{..}"
// 2. When the done (null, user) function is called in the deserializeUser(), Passport JS takes this last object attached to "req.session.passport.user.{..}", and attaches it to "req.user" i.e "req.user.{..}"
// In our case, since after calling the done() in "serializeUser" we had req.session.passport.user.{id: 123, name: "Kyle"},
// calling the done() in the "deserializeUser" will take that last object that was attached to req.session.passport.user.{..} and attach to req.user.{..}
// i.e. req.user.{id: 123, name: "Kyle"}
// 3. So "req.user" will contain the authenticated user object for that session, and you can use it in any of the routes in the Node JS app.
// eg.
// app.get("/dashboard", (req, res) => {
// res.render("dashboard.ejs", {name: req.user.name})
// })

passport.deserializeUser((userObj, done) => {
  done(null, userObj);
});

// Step 5: Use passport.authenticate() as middleware on your login route

// Now you can use passport.authenticate() function within the app.post() and specify the successRedirect and failureRedirect

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

// The ‘local’ signifies that we are using ‘local’ strategy. If you were using google or facebook to authenticate, it would say ‘google’ or ‘facebook’ instead of ‘local’.

// Step 6: Use the “req.isAuthenticated()” function to protect logged in routes

// Passport JS conveniently provides a “req.isAuthenticated()” function, that:

// returns “true” in case an authenticated user is present in “req.session.passport.user”, or
// returns “false” in case no authenticated user is present in “req.session.passport.user”.

// The “req.isAuthenticated()” function can be used to protect routes that can be accessed only after a user is logged in eg. dashboard.

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
};

// Now you can use this function as middleware to protect your routes as follows,
// app.get("/dashboard", checkAuthenticated, (req, res) => {
//     res.render("dashboard.ejs", {name: req.user.name})
//   })

// Similarly, if the user is already logged in and attempt to access the “register” or “login” screen, you can direct them to the (protected) “dashboard” screen.
const checkLoggedIn = (req, res, next) => {
  console.log('CHECKING');
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  next();
};

app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login.ejs');
});

// Step 7: Use “req.logOut()” to clear the sessions object

// Passport JS also conveniently provides us with a “req.logOut()” function, which when called clears the “req.session.passport” object and removes any attached params.

app.delete('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
  console.log('USER LOGGED OUT');
});

// Note that when the req.logOut() function is called, it clears both the “req.session.passport” and the “req.user”
