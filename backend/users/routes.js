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
const ObjectId = require("mongoose").Types.ObjectId;
const kafka = require("../kafka/client");
const { requireSignIn } = require("../configuration/passport");
const {
  USER_LOGIN,
  USER_SIGNUP,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  GET_USER_INVITATIONS,
  GET_USER_SETTLE_UP_LIST,
  SETTLE_UP_WITH_A_USER,
  GET_RECENT_ACTIVITY,
  GET_USER_DEBTS,
  GET_USER_DASHBOARD_BALANCE,
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

// Get all the groups user is invited to
router.get("/invitations", requireSignIn, async (req, res) => {
  kafka.make_request(
    GET_USER_INVITATIONS,
    { user: req.user },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

// Get Users list for settleUp API
router.get("/settle", requireSignIn, async (req, res) => {
  kafka.make_request(
    GET_USER_SETTLE_UP_LIST,
    { user: req.user },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

// Settle up API
router.post("/settle", requireSignIn, async (req, res) => {
  // Construct a schema
  const schema = Joi.object({
    _id: Joi.string().required().messages({
      "any.required": "Select a user to settle the balance.",
      "string.base": "Select a valid user.",
      "string.empty": "Select a valid user.",
    }),
  });
  // Validate the input data
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  if (!ObjectId.isValid(req.body._id)) {
    res.status(400).send({ errorMessage: "Select a valid user." });
    return;
  }

  kafka.make_request(
    SETTLE_UP_WITH_A_USER,
    { body: req.body, user: req.user },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

router.get("/activity", requireSignIn, async (req, res) => {
  // Construct schema
  const schema = Joi.object({
    // 1 -> DESC, 2 -> ASC
    orderBy: Joi.number().integer().min(1).max(2).messages({
      "number.integer": "Select a valid sorting category",
      "number.min": "Select a valid sorting category",
      "number.max": "Select a valid sorting category",
      "number.base": "Select a valid sorting category",
    }),
    pageNumber: Joi.number().integer().min(1).required().messages({
      "number.integer": "Select a valid page number",
      "number.min": "Select a valid page number",
      "number.base": "Select a valid page number",
      "any.required": "Select a valid page number",
    }),
    pageSize: Joi.number().integer().min(1).messages({
      "number.integer": "Select a valid page size",
      "number.min": "Select a valid page size",
      "number.base": "Select a valid page size",
    }),
    // 0 groupId means across all groups
    group_id: Joi.string().messages({
      "string.base": "Select a valid group",
      "string.integer": "Select a valid group",
      "number.min": "Select a valid group",
    }),
  });
  // Validating schema for the input fields
  const result = await schema.validate(req.query);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  if (req.query.group_id && !ObjectId.isValid(req.query.group_id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }
  kafka.make_request(
    GET_RECENT_ACTIVITY,
    { user: req.user, query: req.query },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

// Get user debts
router.get("/debts", requireSignIn, async (req, res) => {
  kafka.make_request(GET_USER_DEBTS, { user: req.user }, (error, results) => {
    if (!results.success) {
      res.status(400).send(results);
    } else {
      res.status(200).send(results);
    }
  });
});

// Get user dashboard balance
router.get("/balance", requireSignIn, async (req, res) => {
  kafka.make_request(
    GET_USER_DASHBOARD_BALANCE,
    { user: req.user },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});
module.exports = router;
