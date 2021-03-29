const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const currencySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    symbol: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Currency = mongoose.model("Currency", currencySchema, "currencies");
module.exports = Currency;
