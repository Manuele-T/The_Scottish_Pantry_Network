require("dotenv").config(); // loads data from .env file
const express = require("express");
const app = express();

const expressHandlebars = require("express-handlebars");
const path = require("path");

// Require the PantryModel file
require('./models/pantryModel');
require('./models/foodModel');

const hbs = expressHandlebars.create({
  extname: ".hbs",
  helpers: {
    eq: function (v1, v2) {
      return v1 === v2;
    },
    formatDate: function (timestamp) {
      var date = new Date(timestamp);
      return date.toLocaleDateString();
    },
  },
  partialsDir: path.join(__dirname, "views", "partial"), // path to your partials
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());
const session = require("express-session");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Add user data to locals object
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

const publicDirectory = path.join(__dirname, "public");
app.use(express.static(publicDirectory));

app.use("/css", express.static(path.join(__dirname, "./node_modules/bootstrap/dist/css")));

app.use("/js", express.static(path.join(__dirname, "./node_modules/bootstrap/dist/js")));

// Assuming you have this directory and files set up
const routes = require("./routes/websiteRoutes");
app.use("/", routes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000. Ctrl^c to quit.");
});