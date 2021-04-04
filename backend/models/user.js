const config = require("../configuration/config");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    number: {
      type: String,
      trim: true,
      min: [10, "Enter a valid number"],
      max: [10, "Enter a valid number"],
    },
    currencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      default: config.defaultCurrencyId,
      required: true,
    },
    timezone: {
      type: String,
      trim: true,
      default: "America/Los_Angeles",
      required: true,
    },
    language: {
      type: String,
      trim: true,
      default: "en",
      required: true,
    },
    image: {
      type: String,
    },
    invites: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    memberships: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    activities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
