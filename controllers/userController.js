// Imports necessary models and libraries
const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// Displays the login page
exports.show_login = function (req, res) {
  res.render("user/login");
};
// Processes login requests
exports.handle_login = function (req, res) {
  console.log("handle_login called");
  let { username, password } = req.body;
  username = username.toLowerCase();  // Convert username to lowercase to ensure consistency
  User.findUserByUsername(username)  // Look up the user by username
    .then(user => {
      if (!user) {
        res.status(401).send("Login failed: User does not exist");  // User not found
      } else {
        const validPassword = true;  // Assuming password validation placeholder
        if (!validPassword) {
          return res.status(401).send("Invalid password");  // Password does not match
        }
        const payload = { username: user.username, role: user.role };  // Create JWT payload
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });  // Sign the JWT
        res.cookie('jwt', accessToken, { httpOnly: true, sameSite: 'strict', path: '/' });  // Set the JWT as a cookie
        console.log("JWT set: ", accessToken);
        req.session.user = user;  // Set the user in the session
        res.redirect("/");  // Redirect to the home page
      }
    })
    .catch(error => {
      console.log("Error occurred while finding user:", error);
      res.status(500).send("Internal Server Error");  // Handle any other errors
    });
};
// Displays the registration page
exports.show_register_page = function (req, res) {
  res.render("user/register");
};
// Logs out the user
exports.logout = function (req, res) {
  req.session.destroy(err => {  // Destroy the session
    if (err) {
      console.log("Error occurred while destroying session:", err);
      return res.status(500).send("Internal Server Error");
    } else {
      res.clearCookie("jwt");  // Clear the JWT cookie
      res.redirect("/");  // Redirect to the home page
    }
  });
};
// Handles new user registration
exports.post_new_user = function (req, res) {
  let { username, password } = req.body;
  username = username.toLowerCase();  // Normalize the username
  if (!username || !password) {
    res.status(400).send("Both username and password are required");  // Ensure both fields are filled
  } else {
    User.findUserByUsername(username)  // Check if user already exists
      .then(existingUser => {
        if (existingUser) {
          res.status(400).send("User already exists");  // User exists, can't create new
        } else {
          bcrypt.hash(password, saltRounds, function(err, hash) {  // Hash the password
            if (err) {
              console.log("Error during password hashing:", err);
              res.status(500).send("Internal Server Error");
            } else {
              User.createUser(username, hash, "Grower", true, null)  // Create the user
                .then(() => {
                  res.redirect("/login");  // Redirect to login after registration
                })
                .catch(error => {
                  console.log("Error in user registration:", error);
                  res.status(500).send("Internal Server Error");
                });
            }
          });
        }
      })
      .catch(error => {
        console.log("Error during user lookup:", error);
        res.status(500).send("Internal Server Error"); // Error message
      });
  }
};