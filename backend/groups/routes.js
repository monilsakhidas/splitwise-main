const express = require("express");
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const kafka = require("../kafka/client");
const { requireSignIn } = require("../configuration/passport");
const {
  GROUP_CREATE,
  GROUP_UPDATE_DETAILS,
  GROUP_ACCEPT_INVITATION,
  GROUP_DECLINE_INVITATION,
  GET_GROUP_DETAILS,
  SEARCH_GROUPS,
} = require("../kafka/topics");
const router = express.Router();

// Init storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/group/");
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
const uploadGroupImage = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post(
  "/create",
  requireSignIn,
  uploadGroupImage.single("groupImage"),
  async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().min(1).max(64).required().messages({
        "any.required": "Group name is required",
        "string.empty": "Group name cannot be empty.",
        "string.max": "Name of the group should be lesser than 64 characters",
        "string.min": "Group name cannot be empty",
      }),
      users: Joi.string().required().empty().messages({
        "any.required": "Select atleast 1 user to form a group",
        "string.empty": "Select atleast 1 user to form a group",
      }),
    });
    const result = await schema.validate(req.body);
    // Convert the comma separated string into alist of unique users
    try {
      req.body.users = Array.from(new Set(req.body.users.split(",")));
    } catch (error) {
      res.status(400).send({ errorMessage: "Select valid users" });
    }
    if (result.error) {
      res.status(400).send({ errorMessage: result.error.details[0].message });
      return;
    } else if (req.body.users.includes(String(req.user._id))) {
      res.status(400).send({
        errorMessage:
          "Cannot select yourself as a group member. You will automatically added into the group as you are creating it.",
      });
      return;
    }
    kafka.make_request(
      GROUP_CREATE,
      { user: req.user, body: req.body, file: req.file },
      (error, results) => {
        if (!results.success) {
          res.status(400).send(results);
        } else {
          res.status(200).send(results);
        }
      }
    );
  }
);

// Update Group details such as image, name (Not adding or removing members as it is not the part of requirements)
router.put(
  "/editgroup",
  requireSignIn,
  uploadGroupImage.single("groupImage"),
  async (req, res) => {
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path.substring(req.file.path.indexOf("/") + 1);
    }
    // contruct expected schema
    const schema = Joi.object({
      name: Joi.string().min(1).max(64).required().messages({
        "any.required": "Group name is required",
        "string.empty": "Group name cannot be empty.",
        "string.max": "Name of the group should be lesser than 64 characters",
        "string.min": "Group name cannot be empty",
      }),
      _id: Joi.string().required().messages({
        "string.base": "Select a valid group",
        "any.required": "Select a valid group",
      }),
    });
    // validate schema
    const result = await schema.validate(req.body);
    if (result.error) {
      res.status(400).send({ errorMessage: result.error.details[0].message });
      return;
    }

    kafka.make_request(
      GROUP_UPDATE_DETAILS,
      { body: req.body, user: req.user, file: req.file },
      (error, results) => {
        if (!results.success) {
          res.status(400).send(results);
        } else {
          res.status(200).send(results);
        }
      }
    );
  }
);

// Get all the groups the user is member of
router.get("/mygroups", requireSignIn, async (req, res) => {
  kafka.make_request(SEARCH_GROUPS, { user: req.user }, (error, results) => {
    if (!results.success) {
      res.status(400).send(results);
    } else {
      res.status(200).send(results);
    }
  });
});

// Get group details using group Id
router.get("/:id", requireSignIn, async (req, res) => {
  // Construct expected schema
  const schema = Joi.string().required().messages({
    "any.required": "Select a valid group",
    "string.base": "Select a valid group",
  });
  // Validate schema
  const result = await schema.validate(req.params.id);
  kafka.make_request(
    GET_GROUP_DETAILS,
    { user: req.user, params: req.params },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

// Accept an invitation
router.post("/accept", requireSignIn, async (req, res) => {
  // contruct expected schema
  const schema = Joi.object({
    _id: Joi.string().required().messages({
      "any.required": "Select a valid group",
      "string.base": "Select a valid group",
      "string.empty": "Select a valid group",
    }),
  });
  // validate schema
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  kafka.make_request(
    GROUP_ACCEPT_INVITATION,
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

// Decline an invitation
router.post("/reject", requireSignIn, async (req, res) => {
  // contruct expected schema
  const schema = Joi.object({
    _id: Joi.string().required().messages({
      "any.required": "Select a valid group",
      "string.base": "Select a valid group",
      "string.empty": "Select a valid group",
    }),
  });
  // validate schema
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  kafka.make_request(
    GROUP_DECLINE_INVITATION,
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

module.exports = router;