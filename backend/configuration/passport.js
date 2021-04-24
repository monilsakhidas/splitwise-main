"use strict";

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const models = require("../models/modelsStore");
const config = require("./config");

let options = {};
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = config.jwtSecretKey;

const initializePassport = () => {
  passport.use(
    new JwtStrategy(options, (decodedPayload, callback) => {
      console.log(decodedPayload);
      const userId = decodedPayload._id;
      models.users.findById(
        userId,
        "currencyId number name language timezone email",
        (error, user) => {
          console.log(userId);
          if (error) {
            return callback(error, false);
          } else if (user) {
            callback(null, user);
          } else {
            callback(null, false);
          }
        }
      );
    })
  );
};

const requireSignIn = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    if (error || !user) {
      const error = {
        errorMessage: "Please login to continue",
      };
      return res.status(401).json(error);
    } else {
      req.user = user;
    }
    return next();
  })(req, res, next);
};

module.exports = {
  initializePassport,
  requireSignIn,
};
