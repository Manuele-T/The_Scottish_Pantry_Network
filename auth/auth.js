const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
exports.login = async function (req, res) {
  console.log("Login function called"); // Log when the function is called
  let { username, password } = req.body;
  try {
    console.log("Finding user", username); // Log the username being looked up
    const user = await userModel.findUserByUsername(username.toLowerCase());
    if (!user) {
      console.log("Login attempt failed: User not found", username);
      return res.render("user/register");
    }
    console.log("User found", user.username); // Log the username of the found user
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      console.log("Login attempt failed: Invalid password", username);
      return res.render("user/login");
    }
    const payload = { username: user.username, role: user.role, isBlocked: user.isBlocked};
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "23h",
    });
    console.log("JWT created:", accessToken); // Log the token
    res.cookie("jwt", accessToken, { httpOnly: true, sameSite: 'strict', path: '/' });
    console.log("JWT cookie set for user", username);
    res.redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.verify = function (req, res, next) {
  console.log("Cookies:", req.cookies); // Log all cookies
  const token = req.cookies.jwt;
  console.log("JWT:", token); // Log the JWT
  if (!token) {
    console.log("Verification failed: No token provided");
    return res.status(403).send("Access denied. No token provided.");
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log("JWT verification error:", err);
      return res.status(401).send("Invalid token.");
    }
    console.log("JWT verified successfully for user", decoded.username);

    // Fetch the user from the database
    const user = await userModel.findUserByUsername(decoded.username);

    // Check if user is blocked
    if (user.isBlocked === true) {
      return res.status(403).send('Your account has been blocked');
    }
    req.user = decoded; // Adding decoded payload to request object
    next();
  });
};
exports.refreshToken = function (req, res) {
  const oldToken = req.cookies.jwt;
  jwt.verify(oldToken, process.env.ACCESS_TOKEN_SECRET, { ignoreExpiration: true }, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token. Cannot refresh.");
    }
    const newPayload = { username: decoded.username, role: decoded.role };
    const newToken = jwt.sign(newPayload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h"
    });
    res.cookie("jwt", newToken, { httpOnly: true, sameSite: 'strict' });
    res.send("Token refreshed successfully.");
  });
};
exports.verifyRole = function (roles) {
  return async function (req, res, next) {
    const token = req.cookies.jwt;
    if (!token) {
      console.log("No token provided for role verification");
      return res.status(403).send("Access denied. No token provided.");
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      // Fetch the user from the database
      const user = await userModel.findUserByUsername(decoded.username);
      // Check user role first
      if (!roles.includes(user.role)) {
        console.log("User role not permitted", user.role);
        return res.status(403).send("Access denied. You do not have the required permission.");
      }
      // Then check if user is blocked
      if (user.isBlocked === true) {
        return res.status(403).send('Your account has been blocked');
      }
      req.user = user; // Adding user object to request object
      next();
    } catch (ex) {
      console.log("Invalid token during role verification", ex);
      res.status(401).send("Invalid token.");
    }
  };
};