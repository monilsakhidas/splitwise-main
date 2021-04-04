const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const debtSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    user1: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Debt = mongoose.model("Debt", debtSchema, "debts");
module.exports = Debt;
