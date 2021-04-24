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
  GROUP_ADD_EXPENSE,
  GET_GROUP_BALANCES,
  GET_GROUP_DEBTS,
  GET_GROUP_EXPENSES,
  ADD_COMMENTS_EXPENSE,
  DELETE_COMMENT_EXPENSE,
  GROUP_LEAVE,
} = require("../kafka/topics");
const ObjectId = require("mongoose").Types.ObjectId;
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

// Add an expense
router.post("/addexpense", requireSignIn, async (req, res) => {
  // Constructing a schema to validate input
  const schema = Joi.object({
    description: Joi.string().min(1).max(64).required().empty().messages({
      "string.base": "Enter a valid string as description.",
      "string.min": "Enter a valid description.",
      "string.max": "Enter a description in less than 64 characters.",
      "any.required": "Enter a valid description.",
      "string.empty": "Enter a valid description.",
    }),
    group_id: Joi.string().required().messages({
      "string.base": "Select a valid group for adding expense.",
      "any.required": "Select a valid group for adding expense.",
      "string.empty": "Select a valid group for adding expense.",
    }),
    amount: Joi.number().positive().required().messages({
      "number.positive": "Enter a valid amount.",
      "number.base": "Enter a valid amount.",
      "any.required": "Enter a valid amount.",
    }),
  });
  // Validating the input object
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  if (!ObjectId.isValid(req.body.group_id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }

  kafka.make_request(
    GROUP_ADD_EXPENSE,
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

// get group balances
router.get("/groupbalance/:id", requireSignIn, async (req, res) => {
  // Construct expected schema
  const schema = Joi.string().required().messages({
    "any.required": "Select a valid group",
    "string.base": "Select a valid group",
    "string.empty": "Select a valid group",
  });
  // Validate schema
  const result = await schema.validate(req.params.id);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }
  kafka.make_request(
    GET_GROUP_BALANCES,
    {
      user: req.user,
      params: req.params,
    },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

// Get group debts
router.get("/debts/:id", requireSignIn, async (req, res) => {
  // Construct expected schema
  const schema = Joi.string().required().messages({
    "any.required": "Select a valid group",
    "string.base": "Select a valid group",
    "string.empty": "Select a valid group",
  });
  // Validate schema
  const result = await schema.validate(req.params.id);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }

  kafka.make_request(
    GET_GROUP_DEBTS,
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

// Get Group expenses
router.get("/expenses/:id", requireSignIn, async (req, res) => {
  const schema = Joi.string().required().messages({
    "any.required": "Select a valid group",
    "string.base": "Select a valid group",
    "string.empty": "Select a valid group",
  });
  // Validate schema
  const result = await schema.validate(req.params.id);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }

  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }

  kafka.make_request(
    GET_GROUP_EXPENSES,
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

// Add expense comments
router.post("/addcomment", requireSignIn, async (req, res) => {
  const schema = Joi.object({
    comment: Joi.string()
      .max(1024)
      .required()
      .pattern(/[$\\<>?!.()]/, { invert: true })
      .messages({
        "any.required": "Enter a valid comment.",
        "string.base": "Enter a valid comment.",
        "string.empty": "Enter a valid comment.",
        "string.pattern.invert.base": "Enter a valid comment.",
        "string.max":
          "Length of the comment should not exceed more than 1024 characters.",
      }),
    expense_id: Joi.string().required().messages({
      "any.required": "Select a valid group",
      "string.base": "Select a valid group",
      "string.empty": "Select a valid group",
    }),
    group_id: Joi.string().required().messages({
      "any.required": "Select a valid group",
      "string.base": "Select a valid group",
      "string.empty": "Select a valid group",
    }),
  });
  // Validate schema
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body.expense_id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body.group_id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }
  kafka.make_request(
    ADD_COMMENTS_EXPENSE,
    { user: req.user, body: req.body },
    (error, results) => {
      if (!results.success) {
        res.status(400).send(results);
      } else {
        res.status(200).send(results);
      }
    }
  );
});

router.post("/removecomment", requireSignIn, async (req, res) => {
  const schema = Joi.object({
    expense_id: Joi.string().required().messages({
      "any.required": "Select a valid expense",
      "string.base": "Select a valid expense",
      "string.empty": "Select a valid expense",
    }),
    comment_id: Joi.string().required().messages({
      "any.required": "Select a valid comment",
      "string.base": "Select a valid comment",
      "string.empty": "Select a valid comment",
    }),
    group_id: Joi.string().required().messages({
      "any.required": "Select a valid group",
      "string.base": "Select a valid group",
      "string.empty": "Select a valid group",
    }),
  });
  // Validate schema
  const result = await schema.validate(req.body);
  if (result.error) {
    res.status(400).send({ errorMessage: result.error.details[0].message });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body.expense_id)) {
    res.status(400).send({ errorMessage: "Select a valid expense" });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body.comment_id)) {
    res.status(400).send({ errorMessage: "Select a valid comment" });
    return;
  }
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body.group_id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }
  kafka.make_request(
    DELETE_COMMENT_EXPENSE,
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

// Leave a group
router.post("/leave", requireSignIn, async (req, res) => {
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
  // If the inputted objectId is invalid
  if (!ObjectId.isValid(req.body._id)) {
    res.status(400).send({ errorMessage: "Select a valid group" });
    return;
  }

  kafka.make_request(
    GROUP_LEAVE,
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
