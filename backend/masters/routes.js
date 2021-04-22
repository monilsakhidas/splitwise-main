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
});

router.get("/test", async (req, res) => {
  const x = await models.activities.aggregate([
    {
      $match: {
        $and: [{ expenseBalance: 0.5 }],
      },
    },
    {
      $count: "total",
    },
  ]);
  console.log(x);
  res.status(200).send(x);
});

module.exports = router;

// let tranSchemaDoc1 = await transactionSchema.aggregate([
//   {
//       $match: {
//           $and: [
//               { paidByUserId: mongoose.Types.ObjectId(userId) },
//               { settleFlag: 'N' },
//               { tranType: "6" }
//           ]
//       }
//   },
//   {
//       $group: {
//           _id: "$paidForUserId",
//           total: { $sum: "$amount" }
//       }
//   }])
