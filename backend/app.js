"use strict";

// imports
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const config = require("./configuration/config");
const mongoose = require("./configuration/database");
const models = require("./models/modelsStore");
const users = require("./users/routes");
const masters = require("./masters/routes");
const { initializePassport } = require("./configuration/passport");
// Port number
const PORT = process.env.PORT || 3001;

// Initializing the Application
const app = express();

// Adding the middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// Using Passport for authentication
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

//Allow Access Control
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", config.frontendUrl);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.setHeader("Cache-Control", "no-cache");
  next();
});

// Adding the routes
app.use("/users", users);
app.use("/masters", masters);

// Starting the server
app.listen(PORT, () => {
  console.log("Backend Server started on port: ", PORT);
});
