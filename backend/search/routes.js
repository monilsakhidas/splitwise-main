const express = require("express");
const Joi = require("joi");
const kafka = require("../kafka/client");
const { SEARCH_USERS } = require("../kafka/topics");
const { requireSignIn } = require("../configuration/passport");
const router = express.Router();

router.get("/users", requireSignIn, async (req, res) => {
  const keywordValidation = Joi.string().required().min(1).messages({
    "string.required": "Keyword is required for searching users",
  });
  const result = await keywordValidation.validate(req.query.keyword);
  if (result.error) {
    res.status(200).send({ users: [] });
    return;
  } else {
    kafka.make_request(
      SEARCH_USERS,
      { user: req.user, query: req.query },
      (error, results) => {
        if (!results.success) {
          res.status(400).send(results);
        } else {
          res.status(200).send(results);
        }
      }
    );
  }
});

module.exports = router;
