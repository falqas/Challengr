/*

authController.js
configuring routes for authRouter

*/

// promise library to avoid callback hell
var Promise = require('bluebird');
// module for securely hashing passwords
var bcrypt = require('bcrypt-nodejs');
// module implementing authO jwt's
var jwt = require('jsonwebtoken');

// imports instance of database from database.js
var db = require(__dirname + '/../../database/database.js');

// import database models
var User = db.import(__dirname + '/../../database/model/user.js');
// var Challenge = db.import(path.join(__dirname, '/../../database/model/challenge.js'));

module.exports = {
  signup: function (req, res) {
    // Console Log
    console.log('/api/user/signup is being called with body: ' + req.body);
    // pull out user data
    var email = req.body.email;
    var first_name = req.body.firstName;
    var last_name = req.body.lastName;
    var password = req.body.password;

    // query for user with email(unique)
    User.findOne({
        where: {
          email: email
        }
      })
      .then(function (user) {
        // Console Log
        console.log('user with email: ' + email + ' exists: ' + !!user);
        if (user) {
          // respond to client
          res.json({
            success: false,
            message: 'email: ' + email + ' is already in use'
          });
        } else {
          var hashing = Promise.promisify(bcrypt.hash);

          // hash password and save user to the database
          hashing(password, null, null)
            .then(function (hash) {
              // create user in db
              User.create({
                  email: email,
                  first_name: first_name,
                  last_name: last_name,
                  password: hash
                })
                .then(function (user) {
                  // Console Log
                  console.log('user with email: ' + email + ' got created: ' + !!user);
                  // create token
                  var token = jwt.sign(user, process.env.TOKEN_SECRET, {
                    expiresIn: '1h'
                  });

                  // respond to client
                  res.json({
                    success: true,
                    message: 'Successfully signed up with ' + email,
                    token: token,
                    user: {
                      email: user.email,
                      firstName: user.first_name,
                      lastName: user.last_name
                    }
                  });
                });
            });
        }
      });
  },

  signin: function (req, res) {
    // Console Log
    console.log('/api/user/signin is being called with body: ' + req.body);
    // pull out user data
    var email = req.body.email;
    var password = req.body.password;

    // query for user with email(unique)
    User.findOne({
        where: {
          email: email
        }
      })
      .then(function (user) {
        console.log('user with email: ' + email + ' exists: ' + !!user);
        if (!user) {
          // respond to client
          res.json({
            success: false,
            message: 'Wrong email or password'
          });
        } else {
          // compare supplied password and password from database
          bcrypt.compare(password, user.password, function (err, success) {
            if (err) {
              // Console Log
              return console.log('Error ocurred while comparing password: ', err);
            }
            if (!success) {
              // Console Log
              console.log('Wrong password supplied for user with email: ' + email);
              // respond to client
              res.json({
                success: false,
                message: 'Wrong email or password'
              });
            } else {
              // Console Log
              console.log('User with email: ' + email + ' supplied correct credentials');
              // create token
              var token = jwt.sign(user, process.env.TOKEN_SECRET, {
                expiresIn: '1h'
              });

              // respond to client
              res.json({
                success: true,
                message: 'Successfully signed in with: ' + email,
                token: token,
                user: {
                  email: user.email,
                  firstName: user.first_name,
                  lastName: user.last_name
                }
              });
            }
          });
        }
      });
  },

  checkUser: function (req, res) {
    // Console Log
    console.log('checking if user is allowed to access');

    // pull out token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // token exists in request body
    if (token) {
      // Console Log
      console.log('Token exists: ' + !!token);

      // decode and verify token
      jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
          // respond to client
          res.json({
            success: false,
            message: 'Failed decoding token'
          });
        } else {
          // Console Log
          console.log('Successfully authenticated token, access granted');
          // move on to next middleware
          res.json({
            success: true,
            message: 'user is allowed access'
          })
        }
      });
    } else {
      // respond to client
      res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  },

  authenticate: function (req, res, next) {
    // Console Log
    console.log('authenticating user with body: ' + req.body);

    // pull out token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // token exists in request body
    if (token) {
      // Console Log
      console.log('Token exists: ' + !!token);

      // decode and verify token
      jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
        if (err) {
          // respond to client
          res.json({
            success: false,
            message: 'Failed decoding token'
          });
        } else {
          // Console Log
          console.log('Successfully authenticated token, access granted');
          // move on to next middleware
          next();
        }
      });
    } else {
      // respond to client
      res.status(403).send({
        success: false,
        message: 'No token provided'
      });
    }
  }
};
