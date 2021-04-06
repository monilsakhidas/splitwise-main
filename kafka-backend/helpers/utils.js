const models = require("../models/modelsStore");
const mongoose = require("mongoose");
const numeral = require("numeral");

const getIndexOfGroupBalancesArray = (user_id, currency_id, groupBalances) => {
  if (!groupBalances || groupBalances.length == 0) {
    return -1;
  } else {
    for (let i = 0; i < groupBalances.length; i++) {
      if (
        groupBalances[i].user.equals(user_id) &&
        groupBalances[i].currency.equals(currency_id)
      ) {
        return i;
      }
    }
    return -1;
  }
};

const settleUpTheUsers = async (rawDebt) => {
  // find the group instance in which the settle up activity
  // is being carried out
  console.log(rawDebt);
  const group = await models.groups.findById(String(rawDebt.group));

  // find paidBy userId and paidTo userId
  const [toBepaidByUser, toBepaidToUser] =
    rawDebt.amount < 0
      ? [rawDebt.user1, rawDebt.user2]
      : [rawDebt.user2, rawDebt.user1];

  // find amount to be paid
  const amountToBePaid =
    rawDebt.amount < 0 ? -1 * rawDebt.amount : rawDebt.amount;

  // Add expense
  const rawExpense = new models.expenses({
    description: "Settle balance",
    amount: amountToBePaid,
    group: rawDebt.group,
    paidByUser: toBepaidByUser,
    currency: rawDebt.currency,
    transactionType: toBepaidToUser,
  });
  // Save expense
  const expense = await rawExpense.save();

  // Add expense_id in the group
  group.expenses.push(expense._id);

  // Update Group Balances
  const groupBalanceOfPayerIndex = getIndexOfGroupBalancesArray(
    toBepaidByUser,
    rawDebt.currency,
    group.groupBalances
  );

  const groupBalanceOfPayeeIndex = getIndexOfGroupBalancesArray(
    toBepaidToUser,
    rawDebt.currency,
    group.groupBalances
  );

  group.groupBalances[groupBalanceOfPayerIndex].balance += amountToBePaid;
  group.groupBalances[groupBalanceOfPayeeIndex].balance -= amountToBePaid;

  // Save group instance
  await group.save();

  // Find the user instances for payee and payer
  const payer = await models.users.findById(toBepaidByUser);
  const payee = await models.users.findById(toBepaidToUser);

  // Create new activities for payer and payee
  const rawPayerActivity = new models.activities({
    user: toBepaidByUser,
    currency: rawDebt.currency,
    expense: expense._id,
    expenseBalance: 0,
    group: rawDebt.group,
  });

  const rawPayeeActivity = new models.activities({
    user: toBepaidToUser,
    currency: rawDebt.currency,
    expense: expense._id,
    expenseBalance: 0,
    group: rawDebt.group,
  });

  // Saving the activities
  const payerActivity = await rawPayerActivity.save();
  const payeeActivity = await rawPayeeActivity.save();
  payer.activities.push(payerActivity);
  payee.activities.push(payeeActivity);
  // payer.activities = [payerActivity, ...payer.activities];
  // payee.activities = [payeeActivity, ...payee.activities];

  // Saving the users
  await payer.save();
  await payee.save();

  // Update raw debt
  rawDebt.amount = 0;
  await rawDebt.save();
};

const getGroupBalanceStatement = (amount, currencySymbol) => {
  if (amount < 0) {
    return "owes " + currencySymbol + numeral(-1 * amount).format("0.[00]");
  } else if (amount > 0) {
    return "gets back " + currencySymbol + numeral(amount).format("0.[00]");
  } else return null;
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getFormattedAmountWithCurrency = (symbol, amount) => {
  return symbol + numeral(amount).format("0.[00]");
};

const getRecentActivityDescription = (recentActivity, loggedInUser_id) => {
  if (recentActivity.expense.transactionType) {
    if (recentActivity.expense.transactionType._id.equals(loggedInUser_id)) {
      return (
        "You and " +
        capitalizeFirstLetter(recentActivity.expense.paidByUser.name) +
        " settled up."
      );
    } else {
      return (
        "You and " +
        capitalizeFirstLetter(recentActivity.expense.transactionType.name) +
        " settled up."
      );
    }
  } else if (recentActivity.expense.paidByUser._id.equals(loggedInUser_id)) {
    return (
      "You added " +
      '"' +
      recentActivity.expense.description +
      '" in ' +
      '"' +
      capitalizeFirstLetter(recentActivity.expense.group.name) +
      '".'
    );
  } else {
    return (
      capitalizeFirstLetter(recentActivity.expense.paidByUser.name) +
      " added " +
      recentActivity.expense.description +
      '" in ' +
      '"' +
      recentActivity.expense.group.name +
      '".'
    );
  }
};

const getRecentActivityExpenseStatement = (recentActivity) => {
  if (recentActivity.expenseBalance > 0) {
    return (
      "For this expense, you get back " +
      getFormattedAmountWithCurrency(
        recentActivity.currency.symbol,
        recentActivity.expenseBalance
      ) +
      "."
    );
  } else if (recentActivity.expenseBalance < 0) {
    return (
      "For this expense, you owe " +
      getFormattedAmountWithCurrency(
        recentActivity.currency.symbol,
        -recentActivity.expenseBalance
      ) +
      "."
    );
  }
};

const utils = {
  getIndexOfGroupBalancesArray,
  settleUpTheUsers,
  getGroupBalanceStatement,
  capitalizeFirstLetter,
  getFormattedAmountWithCurrency,
  getRecentActivityDescription,
  getRecentActivityExpenseStatement,
};

module.exports = utils;
