const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema(
  {
    expense: {
      type: Schema.Types.ObjectId,
      ref: "Expense",
      required: true,
    },
    expenseBalance: {
      type: Number,
      required: true,
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Activity = mongoose.model("Activity", activitySchema, "activities");
module.exports = Activity;
