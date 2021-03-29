"use strict";
// Imports
const express = require("express");
const Joi = require("joi");
const models = require("../models/modelsStore");
const bcrypt = require("bcrypt");
const config = require("../configuration/config");
const jwt = require("jsonwebtoken");

// Initializing Router
const router = express.Router();

// User SignUp API
router.post("/signup", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string()
      .required()
      .max(64)
      .regex(/^[a-zA-Z ]*$/)
      .messages({
        "any.required": "Enter a valid name.",
        "string.empty": "Enter a valid name.",
        "string.pattern.base": "Enter a valid name",
        "string.max": "Length of the name should not exceed 64 characters",
      }),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Must be a valid email.",
        "string.empty": "Email cannot be empty.",
        "any.required": "Email is required.",
      }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required.",
      "any.required": "Password cannot be empty",
    }),
  });

  // Validating schema for the input fields
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
  const userObject = {
    name: name,
    email: email,
    password: hashedPassword,
  };

  const rawUser = new models.users(userObject);
  try {
    const user = await rawUser.save();
    console.log(user);
    const jwtToken = jwt.sign(user.toJSON(), config.jwtSecretKey, {
      expiresIn: config.jwtExpiryTime,
    });
    res.status(200).send({
      user,
      token: jwtToken,
      message: "Signed up successfully.",
    });
    return;
  } catch (error) {
    if (error.code === config.databaseErrorCodes.uniqueKeyConstraintError) {
      res.status(400).send({
        errorMessage: "Account belonging to this email already exists.",
      });
    } else {
      console.log(error);
      res.status(400).send({ error });
      return;
    }
  }
});

// Login route
router.post("/login", async (req, res) => {
  // Check if already logged in
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerHeaderParts = bearerHeader.split(" ");
    const bearerToken = bearerHeaderParts[1];
    try {
      const decodedData = jwt.verify(bearerToken, config.jwtSecretKey);
      const loggedInUser = await models.users.findOne({ _id: decodedData._id });
      // Generate data that should be encoded in user's jwt
      const updatedUnsignedJwtUserObject = {
        id: loggedInUser.id,
        name: loggedInUser.name,
        email: loggedInUser.email,
        currencyId: loggedInUser.currencyId,
      };
      // Generate an updated JWT token
      const updatedJwtToken = jwt.sign(
        updatedUnsignedJwtUserObject,
        config.jwtSecretKey,
        {
          expiresIn: config.jwtExpiryTime,
        }
      );
      res.status(200).send({
        user: updatedUnsignedJwtUserObject,
        token: updatedJwtToken,
        message: "Already logged in.",
      });
      return;
    } catch (err) {
      console.log(err);
    }
  }

  // Creating a schema for validating input fields
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Must be a valid email.",
        "string.empty": "Email cannot be empty.",
        "any.required": "Email is required.",
      }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required.",
      "any.required": "Password cannot be empty",
    }),
  });
  // Validate the input fields
  const result = await schema.validate(req.body);

  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }

  // Check if the user with the input email exists
  models.users
    .findOne({
      email: req.body.email.toLowerCase(),
    })
    .then(async (user) => {
      if (
        user == null ||
        !(await bcrypt.compare(req.body.password, user.password))
      ) {
        res.status(401).send({ errorMessage: "Invalid email or password" });
      } else {
        const unsignedJwtUserObject = {
          _id: user._id,
          name: user.name,
          email: user.email,
          currencyId: user.currencyId,
        };
        // Generate a JWT token
        const jwtToken = jwt.sign(unsignedJwtUserObject, config.jwtSecretKey, {
          expiresIn: config.jwtExpiryTime,
        });
        res.status(200).send({
          user: unsignedJwtUserObject,
          token: jwtToken,
          message: "Logged in successfully.",
        });
      }
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
