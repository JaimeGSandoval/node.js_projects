const express = require('express');
const app = express();

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(express.urlencoded({ extended: false }));

//Middleware
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

authUser = (user, password, done) => {
  console.log(`Value of "User" in authUser function ----> ${user}`); //passport will populate, user = req.body.username
  console.log(`Value of "Password" in authUser function ----> ${password}`); //passport will popuplate, password = req.body.password

  // Use the "user" and "password" to search the DB and match user/password to authenticate the user
  // 1. If the user not found, done (null, false)
  // 2. If the password does not match, done (null, false)
  // 3. If user found and password match, done (null, user)

  //Let's assume that DB search that user found and password matched for Kyle
  let authenticated_user = { id: 123, name: 'Kyle' };

  return done(null, authenticated_user);
};

passport.use(new LocalStrategy(authUser));

passport.serializeUser((user, done) => {
  console.log(`--------> Serialize User`);
  console.log(user);

  // Passport will pass the authenticated_user to serializeUser as "user"
  // This is the USER object from the done() in auth function
  // Now attach using done (null, user.id) tie this user to the req.session.passport.user = {id: user.id}, so that it is tied to the session object
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('---------> Deserialize Id');
  console.log(id);

  // This is the id that is saved in req.session.passport.{ user: "id"} during the serialization
  // use the id to find the user in the DB and get the user object with user details
  // USE id TO QUERY DB AND FIND USER HERE
  // pass the USER object in the done() of the de-serializer
  // this USER object is attached to the "req.user", and can be used anywhere in the App.
  done(null, { name: 'Kyle', id: 123, role: 'admin' });
});

// if the user is already logged in and attempt to access the “register” or “login” screen, you can direct them to the (protected) “dashboard” screen.
const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('LOGGED IN AND REDIRECTED TO /dashboard');
    return res.redirect('/dashboard');
  }
  next();
};

// if the user is already logged in and attempt to access the “register” or “login” screen, you can direct them to the (protected) “dashboard” screen.
const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
  next();
};

//Middleware to see how the params are populated by Passport
let count = 1;

printData = (req, res, next) => {
  console.log('\n==============================');
  console.log(`------------>  ${count++}`);

  console.log(`req.body.username -------> ${req.body.username}`);
  console.log(`req.body.password -------> ${req.body.password}`);

  console.log(`\n req.session.passport -------> `);
  console.log(req.session.passport);

  console.log(`\n req.user -------> `);
  console.log(req.user);

  console.log('\n Session and Cookie');
  console.log(`req.session.id -------> ${req.session.id}`);
  console.log(`req.session.cookie -------> `);
  console.log(req.session.cookie);

  console.log('===========================================\n');

  next();
};

app.use(printData); //user printData function as middleware to print populated variables

app.listen(3001, () => console.log(`Server started on port 3001...`));

app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login.ejs');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  function (req, res) {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', checkAuthenticated, (req, res) => {
  console.log('WORKS', req.user);
  res.render('dashboard.ejs', { name: req.user.name });
});

app.delete('/logout', checkAuthenticated, (req, res) => {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    console.log('USER LOGGED OUT');
    res.redirect('/login');
  });
});
