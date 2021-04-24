const config = require("../configuration/config");
const groupBalanceSchema = require("./groupBalance");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: false,
      unique: true,
    },
    image: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    groupBalances: [groupBalanceSchema],
    expenses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Expense",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Group = mongoose.model("Group", groupSchema, "groups");
module.exports = Group;
