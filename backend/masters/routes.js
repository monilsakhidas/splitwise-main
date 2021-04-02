"use strict";

// imports
const express = require("express");
const { requireSignIn } = require("../configuration/passport");
const models = require("../models/modelsStore");
const { GET_ALL_CURRENCIES } = require("../kafka/topics");
const kafka = require("../kafka/client");
const router = express.Router();

router.get("/currencies", requireSignIn, async (req, res) => {
  kafka.make_request(GET_ALL_CURRENCIES, {}, (error, results) => {
    if (!results.success) {
      console.log(results);
      res.status(400).send(results);
    } else {
      console.log(results);
      res.status(200).send(results);
    }
  });

  // models.currencies.find({}).then((currencyList) => {
  //   res.status(200).send({ currencyList });
  // });
});

module.exports = router;
