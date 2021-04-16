const models = require("../../models/modelsStore");
const {
  getFormattedAmountWithCurrency,
  getPersonalOwesYouBalanceStatement,
  getPersonalOwingBalanceStatement,
  capitalizeFirstLetter,
} = require("../../helpers/utils");
const _ = require("lodash");

const handle_request = async (req, callback) => {
  const youAreOwed = {};
  const youOwe = {};

  // When the loggedIUser is user1
  let rawDebts1 = await models.debts
    .find({
      user1: req.user._id,
      amount: {
        $ne: 0,
      },
    })
    .populate("user1", "name image")
    .populate("user2", "name image")
    .populate("group", "name")
    .populate("currency", "symbol");

  // When the loggedInUser is user2
  let rawDebts2 = await models.debts
    .find({
      user2: req.user._id,
      amount: {
        $ne: 0,
      },
    })
    .populate("user1", "name image")
    .populate("user2", "name image")
    .populate("group", "name")
    .populate("currency", "symbol");

  // Processing the debts where user1 is the logged in user

  // Group by the other user's id
  const debtsGroupedByUserId1 = _.chain(rawDebts1)
    .groupBy((rawDebt) => {
      return rawDebt.user2._id;
    })
    .value();

  for (let userId in debtsGroupedByUserId1) {
    const debtsGroupedByUserIdByCurrencyId = _.chain(
      debtsGroupedByUserId1[userId]
    )
      .groupBy((debtGroupedByUserId) => {
        return debtGroupedByUserId.currency._id;
      })
      .value();

    // Initializing the entry for each user in both the dictionaries
    if (!youAreOwed[userId]) youAreOwed[userId] = {};
    if (!youAreOwed[userId]["statements"])
      youAreOwed[userId]["statements"] = [];
    if (!youAreOwed[userId]["amount"]) youAreOwed[userId]["amount"] = {};
    if (!youAreOwed[userId]["name"])
      youAreOwed[userId]["name"] = capitalizeFirstLetter(
        debtsGroupedByUserId1[userId][0]["user2"]["name"]
      );
    if (!youAreOwed[userId]["image"])
      youAreOwed[userId]["image"] =
        debtsGroupedByUserId1[userId][0]["user2"]["image"];

    if (!youOwe[userId]) youOwe[userId] = {};
    if (!youOwe[userId]["statements"]) youOwe[userId]["statements"] = [];
    if (!youOwe[userId]["amount"]) youOwe[userId]["amount"] = {};
    if (!youOwe[userId]["name"])
      youOwe[userId]["name"] = capitalizeFirstLetter(
        debtsGroupedByUserId1[userId][0]["user2"]["name"]
      );
    if (!youOwe[userId]["image"])
      youOwe[userId]["image"] =
        debtsGroupedByUserId1[userId][0]["user2"]["image"];

    // Iteratiing through currencies
    for (let currencyId in debtsGroupedByUserIdByCurrencyId) {
      // Money lent to others
      let positiveAmount = 0;

      // Money lent from others
      let negativeAmount = 0;

      for (
        let index = 0;
        index < debtsGroupedByUserIdByCurrencyId[currencyId].length;
        index++
      ) {
        // Money lent to others
        if (debtsGroupedByUserIdByCurrencyId[currencyId][index].amount > 0) {
          youAreOwed[userId]["statements"].push(
            getPersonalOwesYouBalanceStatement(
              debtsGroupedByUserIdByCurrencyId[currencyId][index].user2.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].currency
                .symbol,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].group.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].amount
            )
          );
          positiveAmount =
            positiveAmount +
            debtsGroupedByUserIdByCurrencyId[currencyId][index].amount;
        } else {
          youOwe[userId]["statements"].push(
            getPersonalOwingBalanceStatement(
              debtsGroupedByUserIdByCurrencyId[currencyId][index].user2.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].currency
                .symbol,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].group.name,
              -1 * debtsGroupedByUserIdByCurrencyId[currencyId][index].amount
            )
          );
          negativeAmount =
            negativeAmount +
            -1 * debtsGroupedByUserIdByCurrencyId[currencyId][index].amount;
        }
      }
      if (
        positiveAmount > 0 &&
        debtsGroupedByUserIdByCurrencyId[currencyId].length != 0
      ) {
        if (!youAreOwed[userId]["amount"][currencyId]) {
          youAreOwed[userId]["amount"][
            currencyId
          ] = getFormattedAmountWithCurrency(
            debtsGroupedByUserIdByCurrencyId[currencyId][0].currency.symbol,
            positiveAmount
          );
        } else {
          youAreOwed[userId]["amount"][
            currencyId
          ] = getFormattedAmountWithCurrency(
            youAreOwed[userId]["amount"][currencyId][0],
            Number(
              youAreOwed[userId]["amount"][currencyId].slice(
                youAreOwed[userId]["amount"][currencyId][0].length,
                youAreOwed[userId]["amount"][currencyId].length
              )
            ) + positiveAmount
          );
        }
      }
      if (
        negativeAmount > 0 &&
        debtsGroupedByUserIdByCurrencyId[currencyId].length != 0
      ) {
        if (!youOwe[userId]["amount"][currencyId]) {
          youOwe[userId]["amount"][currencyId] = getFormattedAmountWithCurrency(
            debtsGroupedByUserIdByCurrencyId[currencyId][0].currency.symbol,
            negativeAmount
          );
        } else {
          youOwe[userId]["amount"][currencyId] = getFormattedAmountWithCurrency(
            youOwe[userId]["amount"][currencyId][0],
            Number(
              youOwe[userId]["amount"][currencyId].slice(
                youOwe[userId]["amount"][currencyId][0].length,
                youOwe[userId]["amount"][currencyId].length
              )
            ) + negativeAmount
          );
        }
      }
    }
    // delete unnecessary entries
    if (youAreOwed[userId]["statements"].length == 0) {
      delete youAreOwed[userId];
    }
    if (youOwe[userId]["statements"].length == 0) {
      delete youOwe[userId];
    }
  }

  // Processing the debts where user2 is the logged in user
  // Group by the other user's id
  const debtsGroupedByUserId2 = _.chain(rawDebts2)
    .groupBy((rawDebt) => {
      return rawDebt.user1._id;
    })
    .value();

  for (let userId in debtsGroupedByUserId2) {
    const debtsGroupedByUserIdByCurrencyId = _.chain(
      debtsGroupedByUserId2[userId]
    )
      .groupBy((debtGroupedByUserId) => {
        return debtGroupedByUserId.currency._id;
      })
      .value();

    // Initializing the entry for each user
    if (!youAreOwed[userId]) youAreOwed[userId] = {};
    if (!youAreOwed[userId]["statements"])
      youAreOwed[userId]["statements"] = [];
    if (!youAreOwed[userId]["amount"]) youAreOwed[userId]["amount"] = {};
    if (!youAreOwed[userId]["name"])
      youAreOwed[userId]["name"] = capitalizeFirstLetter(
        debtsGroupedByUserId2[userId][0]["user1"]["name"]
      );
    if (!youAreOwed[userId]["image"])
      youAreOwed[userId]["image"] =
        debtsGroupedByUserId2[userId][0]["user1"]["image"];
    if (!youOwe[userId]) youOwe[userId] = {};
    if (!youOwe[userId]["statements"]) youOwe[userId]["statements"] = [];
    if (!youOwe[userId]["amount"]) youOwe[userId]["amount"] = {};
    if (!youOwe[userId]["name"])
      youOwe[userId]["name"] = capitalizeFirstLetter(
        debtsGroupedByUserId2[userId][0]["user1"]["name"]
      );
    if (!youOwe[userId]["image"])
      youOwe[userId]["image"] =
        debtsGroupedByUserId2[userId][0]["user1"]["image"];

    // Iterating through currencies
    for (let currencyId in debtsGroupedByUserIdByCurrencyId) {
      // Money lent to others
      let positiveAmount = 0;

      // Money lent from others
      let negativeAmount = 0;

      for (
        let index = 0;
        index < debtsGroupedByUserIdByCurrencyId[currencyId].length;
        index++
      ) {
        // Money lent to others
        if (debtsGroupedByUserIdByCurrencyId[currencyId][index].amount < 0) {
          youAreOwed[userId]["statements"].push(
            getPersonalOwesYouBalanceStatement(
              debtsGroupedByUserIdByCurrencyId[currencyId][index].user1.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].currency
                .symbol,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].group.name,
              -1 * debtsGroupedByUserIdByCurrencyId[currencyId][index].amount
            )
          );
          positiveAmount =
            positiveAmount +
            -1 * debtsGroupedByUserIdByCurrencyId[currencyId][index].amount;
        }
        // Money lent from others
        else {
          youOwe[userId]["statements"].push(
            getPersonalOwingBalanceStatement(
              debtsGroupedByUserIdByCurrencyId[currencyId][index].user1.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].currency
                .symbol,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].group.name,
              debtsGroupedByUserIdByCurrencyId[currencyId][index].amount
            )
          );
          negativeAmount =
            negativeAmount +
            debtsGroupedByUserIdByCurrencyId[currencyId][index].amount;
        }
      }
      if (
        positiveAmount > 0 &&
        debtsGroupedByUserIdByCurrencyId[currencyId].length != 0
      ) {
        if (!youAreOwed[userId]["amount"][currencyId]) {
          youAreOwed[userId]["amount"][
            currencyId
          ] = getFormattedAmountWithCurrency(
            debtsGroupedByUserIdByCurrencyId[currencyId][0].currency.symbol,
            positiveAmount
          );
        } else {
          youAreOwed[userId]["amount"][
            currencyId
          ] = getFormattedAmountWithCurrency(
            youAreOwed[userId]["amount"][currencyId][0],
            Number(
              youAreOwed[userId]["amount"][currencyId].slice(
                youAreOwed[userId]["amount"][currencyId][0].length,
                youAreOwed[userId]["amount"][currencyId].length
              )
            ) + positiveAmount
          );
        }
      }
      if (
        negativeAmount > 0 &&
        debtsGroupedByUserIdByCurrencyId[currencyId].length != 0
      ) {
        if (!youOwe[userId]["amount"][currencyId]) {
          youOwe[userId]["amount"][currencyId] = getFormattedAmountWithCurrency(
            debtsGroupedByUserIdByCurrencyId[currencyId][0].currency.symbol,
            negativeAmount
          );
        } else {
          youOwe[userId]["amount"][currencyId] = getFormattedAmountWithCurrency(
            youOwe[userId]["amount"][currencyId][0],
            Number(
              youOwe[userId]["amount"][currencyId].slice(
                youOwe[userId]["amount"][currencyId][0].length,
                youOwe[userId]["amount"][currencyId].length
              )
            ) + negativeAmount
          );
        }
      }
    }
    // delete unnecessary entries
    if (youAreOwed[userId]["statements"].length == 0) {
      delete youAreOwed[userId];
    }
    if (youOwe[userId]["statements"].length == 0) {
      delete youOwe[userId];
    }
  }

  callback(null, { youAreOwed, youOwe, success: true });
};
exports.handle_request = handle_request;
