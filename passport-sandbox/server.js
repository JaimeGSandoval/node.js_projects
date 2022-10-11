const express = require('express');
const path = require('path');

const app = express();

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

authUser = (user, password, done) => {
  console.log(`Value of "User" in authUser function ----> ${user}`);

  let authenticated_user = { id: 44837, name: user, role: 'admin' };

  return done(null, authenticated_user);
};

passport.use(new LocalStrategy(authUser));

passport.serializeUser((user, done) => {
  console.log(`--------> Serialize User`);
  console.log(user);

  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('---------> Deserialize Id');
  console.log(id);
  // QUERY DB AND GET USER BY id HERE ie user.rows[0]
  // foundUser is example of retrieved user from DB
  const foundUser = { name: 'Kyle', id: 123, role: 'admin' };

  done(null, foundUser);
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
  console.log('CHECK AUTH', req.user);
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
  next();
};

// let count = 1;

// printData = (req, res, next) => {
//   console.log('\n==============================');
//   console.log(`------------>  ${count++}`);

//   console.log(`req.body.username -------> ${req.body.username}`);
//   console.log(`req.body.password -------> ${req.body.password}`);

//   console.log(`\n req.session.passport -------> `);
//   console.log(req.session.passport);

//   console.log(`\n req.user -------> `);
//   console.log(req.user);

//   console.log('\n Session and Cookie');
//   console.log(`req.session.id -------> ${req.session.id}`);
//   console.log(`req.session.cookie -------> `);
//   console.log(req.session.cookie);

//   console.log('===========================================\n');

//   next();
// };

// app.use(printData);

app.listen(3001, () => console.log(`Server started on port 3001...`));

app.get('/login', checkLoggedIn, (req, res) => {
  res.render('login.ejs');
  //   res.status(200).send('You are on the login page');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

// app.post(
//   '/login',
//   passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
//   function (req, res) {
//     console.log('BANKAI', req.user);
//     res.redirect('/dashboard');
//   }
// );

// app.post('/login', (req, res, next) => {
//   console.log('yoooooooo');
//   passport.authenticate('local', function (err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.redirect('/login');
//     }

//     // NEED TO CALL req.login()!!!
//     req.login(user, function (err) {
//       console.log('chi');
//       if (err) {
//         return next(err);
//       }
//       return res.redirect('/dashboard');
//     });
//   })(req, res, next);
// });

app.get('/dashboard', checkAuthenticated, (req, res) => {
  console.log('fucking works', req.user);

  res.render('dashboard.ejs', { name: req.user.name });
  //   console.log('USER YO', req.user);
  //   res.status(200).send('You are on the dashboard page');
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
