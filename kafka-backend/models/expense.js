const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const commentSchema = require("./comment");

const expenseSchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: {
      type: Number,
      validate: {
        validator: function (num) {
          return num > 0;
        },
        message: (props) => `${props.value} is not a positive number`,
      },
      required: true,
    },
    transactionType: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    paidByUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    comments: [commentSchema],
  },
  { timestamps: true, versionKey: false }
);

const Expense = mongoose.model("Expense", expenseSchema, "expenses");
module.exports = Expense;
