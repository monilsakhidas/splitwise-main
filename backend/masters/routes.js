"use strict";

// imports
const express = require("express");
const { requireSignIn } = require("../configuration/passport");
const models = require("../models/modelsStore");
const router = express.Router();

router.get("/currencies", requireSignIn, async (req, res) => {
  models.currencies.find({}).then((currencyList) => {
    console.log(req);
    console.log("===============================");
    console.log(req.user);
    res.status(200).send({ currencyList });
  });
});

module.exports = router;
