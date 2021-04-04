const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupBalanceSchema = new Schema(
  {
    balance: { type: Number, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currency: {
      type: Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = groupBalanceSchema;
