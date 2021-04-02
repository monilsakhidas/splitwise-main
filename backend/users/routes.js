"use strict";
// Imports
const express = require("express");
const Joi = require("joi");
const models = require("../models/modelsStore");
const bcrypt = require("bcrypt");
const config = require("../configuration/config");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const kafka = require("../kafka/client");
const { requireSignIn } = require("../configuration/passport");
const {
  USER_LOGIN,
  USER_SIGNUP,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
} = require("../kafka/topics");

// Initializing Router
const router = express.Router();

// Initializing storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/profile/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "_" +
        req.user._id +
        "_" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

// Middleware to upload images where the image size should be less than 5MB
const uploadProfileImage = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

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

  // Add request to queue
  kafka.make_request(
    USER_SIGNUP,
    { body: req.body, user: req.user },
    (error, results) => {
      if (!results.success) {
        console.log(results);
        res.status(400).send(results);
      } else {
        console.log(results);
        res.status(200).send(results);
      }
    }
  );
});

// Login route
router.post("/login", async (req, res) => {
  // Check if already logged in
  // const bearerHeader = req.headers["authorization"];
  // if (typeof bearerHeader !== "undefined") {
  //   const bearerHeaderParts = bearerHeader.split(" ");
  //   const bearerToken = bearerHeaderParts[1];
  //   try {
  //     const decodedData = jwt.verify(bearerToken, config.jwtSecretKey);
  //     const loggedInUser = await models.users.findOne({ _id: decodedData._id });
  //     // Generate data that should be encoded in user's jwt
  //     const updatedUnsignedJwtUserObject = {
  //       id: loggedInUser.id,
  //       name: loggedInUser.name,
  //       email: loggedInUser.email,
  //       currencyId: loggedInUser.currencyId,
  //     };
  //     // Generate an updated JWT token
  //     const updatedJwtToken = jwt.sign(
  //       updatedUnsignedJwtUserObject,
  //       config.jwtSecretKey,
  //       {
  //         expiresIn: config.jwtExpiryTime,
  //       }
  //     );
  //     res.status(200).send({
  //       user: updatedUnsignedJwtUserObject,
  //       token: updatedJwtToken,
  //       message: "Already logged in.",
  //     });
  //     return;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

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
  const payload = { body: req.body, user: req.user };
  kafka.make_request(USER_LOGIN, payload, (error, results) => {
    if (!results.success) {
      res.status(400).send(results);
    } else {
      res.status(200).send(results);
    }
  });
});

// Get profile page
router.get("/profile", requireSignIn, async (req, res) => {
  const payload = { body: req.body, user: req.user };
  kafka.make_request(GET_USER_PROFILE, payload, (error, results) => {
    if (!results.success) {
      res.status(400).send(results);
    } else {
      res.status(200).send(results);
    }
  });
});

// put profile page
router.put(
  "/profile",
  requireSignIn,
  uploadProfileImage.single("profileImage"),
  async (req, res) => {
    // Creating a schema for validation of input fields
    const schema = Joi.object({
      email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required()
        .messages({
          "string.email": "Enter a valid email.",
          "string.empty": "Enter a valid email.",
          "any.required": "Email is required.",
        }),
      image: Joi.string(),
      name: Joi.string()
        .required()
        .max(64)
        .regex(/^[a-zA-Z ]*$/)
        .messages({
          "any.required": "Enter a valid name.",
          "string.empty": "Enter a valid name.",
          "string.pattern.base": "Enter a valid name.",
          "string.max": "Length of the name should not exceed 64 characters.",
        }),
      timezone: Joi.string().min(1).max(64).required().messages({
        "any.required": "Enter a valid timezone.",
        "string.empty": "Enter a valid timezone.",
      }),
      language: Joi.string().min(1).max(64).required().messages({
        "any.required": "Enter a valid language.",
        "string.empty": "Enter a valid language.",
      }),
      currencyId: Joi.string().trim().required().min(1).messages({
        "any.required": "Enter a valid currency.",
        "string.min": "Enter a valid currency.",
        "string.empty": "Enter a valid currency.",
      }),
      number: Joi.string()
        .regex(/^[0-9]{10}$/)
        .min(10)
        .max(10)
        .messages({
          "string.max": "Enter a valid number.",
          "string.min": "Enter a valid number.",
          "string.pattern.base": "Enter a valid number.",
        }),
    });

    // Validate the input fields
    const result = await schema.validate(req.body);
    if (result.error) {
      res.status(400).send({ errorMessage: result.error.details[0].message });
      return;
    }

    const payload = { body: req.body, user: req.user, file: req.file };
    kafka.make_request(UPDATE_USER_PROFILE, payload, (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    });
  }
);

module.exports = router;
