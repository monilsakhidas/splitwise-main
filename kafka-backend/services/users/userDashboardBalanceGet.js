const models = require("../../models/modelsStore");
const {
  getAmountWithSymbolFromMap,
  getFormattedAmount,
} = require("../../helpers/utils");
const handle_request = async (req, callback) => {
  // Finding user debts
  const rawUserDebts = await models.debts
    .find({
      $and: [
        {
          amount: {
            $ne: 0,
          },
        },
        {
          $or: [{ user1: req.user._id }, { user2: req.user._id }],
        },
      ],
    })
    .populate("currency");

  // Defining dictionaries for maintaining balances
  const youGetAmount = {};
  const youOweAmount = {};
  const totalAmount = {};

  // Processing all the debts
  await rawUserDebts.forEach((rawDebt) => {
    if (rawDebt.user1 == req.user._id) {
      // You have to pay
      if (rawDebt.amount < 0) {
        // If entry exists
        if (youOweAmount[rawDebt.currency._id]) {
          youOweAmount[rawDebt.currency._id]["amount"] =
            youOweAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
          totalAmount[rawDebt.currency._id]["amount"] =
            totalAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
        }
        // If entry does not exist
        else {
          // Check If total amount does not exist for this currency
          if (totalAmount[rawDebt.currency._id]) {
            totalAmount[rawDebt.currency._id]["amount"] =
              totalAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
          }
          // If total amount entry does not exist
          else {
            totalAmount[rawDebt.currency._id] = {};
            totalAmount[rawDebt.currency._id]["symbol"] =
              rawDebt.currency.symbol;
            totalAmount[rawDebt.currency._id]["amount"] = rawDebt.amount;
          }
          youOweAmount[rawDebt.currency._id] = {};
          youOweAmount[rawDebt.currency._id]["amount"] = -rawDebt.amount;
          youOweAmount[rawDebt.currency._id]["symbol"] =
            rawDebt.currency.symbol;
        }
      }
      // You get
      else if (rawDebt.amount > 0) {
        // If entry exists
        if (youGetAmount[rawDebt.currency._id]) {
          youGetAmount[rawDebt.currency._id]["amount"] =
            youGetAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
          totalAmount[rawDebt.currency._id]["amount"] =
            totalAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
        }
        // If entry does not exist
        else {
          youGetAmount[rawDebt.currency._id] = {};
          youGetAmount[rawDebt.currency._id]["amount"] = rawDebt.amount;
          youGetAmount[rawDebt.currency._id]["symbol"] =
            rawDebt.currency.symbol;
          // Check If total amount does not exist for this currency
          if (totalAmount[rawDebt.currency._id]) {
            totalAmount[rawDebt.currency._id]["amount"] =
              totalAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
          }
          // If total amount entry does not exist
          else {
            totalAmount[rawDebt.currency._id] = {};
            totalAmount[rawDebt.currency._id]["symbol"] =
              rawDebt.currency.symbol;
            totalAmount[rawDebt.currency._id]["amount"] = rawDebt.amount;
          }
        }
      }
    } else if (rawDebt.user2 == req.user._id) {
      // You get
      if (rawDebt.amount < 0) {
        // If entry exists
        if (youGetAmount[rawDebt.currency._id]) {
          youGetAmount[rawDebt.currency._id]["amount"] =
            youGetAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
          totalAmount[rawDebt.currency._id]["amount"] =
            totalAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
        }
        // If entry does not exist
        else {
          youGetAmount[rawDebt.currency._id] = {};
          youGetAmount[rawDebt.currency._id]["amount"] = -rawDebt.amount;
          youGetAmount[rawDebt.currency._id]["symbol"] =
            rawDebt.currency.symbol;
          // Check If total amount does not exist for this currency
          if (totalAmount[rawDebt.currency._id]) {
            totalAmount[rawDebt.currency._id]["amount"] =
              totalAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
          }
          // If total amount entry does not exist
          else {
            totalAmount[rawDebt.currency._id] = {};
            totalAmount[rawDebt.currency._id]["symbol"] =
              rawDebt.currency.symbol;
            totalAmount[rawDebt.currency._id]["amount"] = -rawDebt.amount;
          }
        }
      }
      // You have to pay
      else if (rawDebt.amount > 0) {
        // If entry exists
        if (youOweAmount[rawDebt.currency._id]) {
          youOweAmount[rawDebt.currency._id]["amount"] =
            youOweAmount[rawDebt.currency._id]["amount"] + rawDebt.amount;
          totalAmount[rawDebt.currency._id]["amount"] =
            totalAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
        }
        // If entry does not exist
        else {
          youOweAmount[rawDebt.currency._id] = {};
          youOweAmount[rawDebt.currency._id]["amount"] = rawDebt.amount;
          youOweAmount[rawDebt.currency._id]["symbol"] =
            rawDebt.currency.symbol;
          // Check If total amount does not exist for this currency
          if (totalAmount[rawDebt.currency._id]) {
            totalAmount[rawDebt.currency._id]["amount"] =
              totalAmount[rawDebt.currency._id]["amount"] - rawDebt.amount;
          }
          // If total amount entry does not exist
          else {
            totalAmount[rawDebt.currency._id] = {};
            totalAmount[rawDebt.currency._id]["symbol"] =
              rawDebt.currency.symbol;
            totalAmount[rawDebt.currency._id]["amount"] = -rawDebt.amount;
          }
        }
      }
    }
  });

  callback(null, {
    owe: getFormattedAmount(getAmountWithSymbolFromMap(youOweAmount)),
    get: getFormattedAmount(getAmountWithSymbolFromMap(youGetAmount)),
    total: getFormattedAmount(getAmountWithSymbolFromMap(totalAmount)),
    success: true,
  });
};
exports.handle_request = handle_request;
