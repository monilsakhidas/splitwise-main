const models = require("../../models/modelsStore");
const mongoose = require("mongoose");
const {
  getIndexOfGroupBalancesArray,
  capitalizeFirstLetter,
  getFormattedAmountWithCurrency,
} = require("../../helpers/utils");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // dependent on utc plugin
const timezone = require("dayjs/plugin/timezone");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const handle_request = async (req, callback) => {
  // Check whether the logged in user is a member of the group or not
  const group = await models.groups.findById(req.body.group_id);
  if (!group || !group.members || !group.members.includes(req.user._id)) {
    callback(null, {
      errorMessage: "Select a valid group",
      success: false,
    });
    return;
  }
  // Get currency and other details of logged in user
  const user = await models.users.findById(
    req.user._id,
    "currencyId activities timezone image name"
  );

  const currency_id = user.currencyId;
  const currency = await models.currencies.findById(currency_id, "symbol");
  // Find the group Strength
  const totalMembersOfGroup = group.members.length;
  const partitionedAmount = req.body.amount / totalMembersOfGroup;

  // Start session for transaction
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    // Creating the expense
    const expenseArray = await models.expenses.create(
      [
        {
          description: req.body.description,
          amount: req.body.amount,
          group: req.body.group_id,
          paidByUser: req.user._id,
          currency: currency_id,
        },
      ]
      // { session: session }
    );

    const expense = expenseArray[0];
    // Add the expense_id in the group
    if (!group.expenses) {
      group.expenses = [expense._id];
    } else {
      // group.expenses = [expense._id, ...group.expenses];
      group.expenses.push(expense._id);
    }

    // Find all the members of the group except the user who paid the amount
    const membersList = group.members.filter(
      (member) => member != req.user._id
    );

    // Finding/Creating/Updating the group balances

    // Find the group balance
    await membersList.forEach(async (user_id) => {
      let index = getIndexOfGroupBalancesArray(
        user_id,
        currency_id,
        group.groupBalances
      );
      // GroupBalance was not there before therefore we create it.
      if (index === -1) {
        if (!group.groupBalances) {
          group.groupBalances = [
            {
              user: user_id,
              currency: currency_id,
              balance: -partitionedAmount,
            },
          ];
        } else {
          group.groupBalances.push({
            user: user_id,
            currency: currency_id,
            balance: -partitionedAmount,
          });
        }
      }
      // Use the old groupBalance
      else {
        group.groupBalances[index].balance -= partitionedAmount;
      }
    });

    // Update the group balance of the user who financed the expense
    let index = getIndexOfGroupBalancesArray(
      req.user._id,
      currency_id,
      group.groupBalances
    );

    if (index === -1) {
      if (!group.groupBalances) {
        group.groupBalances = [
          {
            user: req.user._id,
            currency: currency_id,
            balance: partitionedAmount * (totalMembersOfGroup - 1),
          },
        ];
      } else {
        group.groupBalances.push({
          user: req.user._id,
          currency: currency_id,
          balance: partitionedAmount * (totalMembersOfGroup - 1),
        });
      }
    } else {
      group.groupBalances[index].balance +=
        partitionedAmount * (totalMembersOfGroup - 1);
    }

    // Save the group instance
    await group
      .save
      // { session: session }
      ();

    // Add data to the debts table
    await membersList.forEach(async (user_id) => {
      const [user_id1, user_id2, amount] =
        req.user._id < user_id
          ? [req.user._id, user_id, partitionedAmount]
          : [user_id, req.user._id, -1 * partitionedAmount];

      // Find if the debt already exists
      const debt = await models.debts.findOne({
        user1: user_id1,
        user2: user_id2,
        currency: currency_id,
        group: req.body.group_id,
      });
      // update debt
      if (debt !== null) {
        debt.amount += amount;
        const updatedDebt = await debt
          .save
          // { session: session }
          ();
      }
      // create new debt
      else {
        const newDebt = await models.debts.create(
          [
            {
              user1: user_id1,
              user2: user_id2,
              currency: currency_id,
              group: req.body.group_id,
              amount,
            },
          ]
          // { session: session }
        );
      }
    });

    // Add activity to the activities table for all the users
    // except the one who financed the expense

    await membersList.forEach(async (user_id) => {
      // Add the activity
      const activityArray = await models.activities.create(
        [
          {
            expense: expense._id,
            expenseBalance: -partitionedAmount,
            currency: currency_id,
            user: user_id,
            group: req.body.group_id,
          },
        ]

        // { session: session }
      );
      const activity = activityArray[0];
      // Find the user and activity in it
      const tempUser = await models.users.findById(user_id);
      if (tempUser.activities == null) {
        tempUser.activities = [activity._id];
      } else {
        tempUser.activities.push(activity._id);
      }
      await tempUser
        .save
        // { session: session }
        ();
    });

    // Add activity for the user who financed the expense
    const activityArray = await models.activities.create(
      [
        {
          expense: expense._id,
          expenseBalance: (totalMembersOfGroup - 1) * partitionedAmount,
          currency: currency_id,
          user: req.user._id,
          group: req.body.group_id,
        },
      ]

      // { session: session }
    );

    const activity = activityArray[0];

    // Add activity in it
    if (user.activities == null) {
      user.activities = [activity._id];
    } else {
      user.activities.push(activity._id);
    }

    await user
      .save
      // {session:session}
      ();
    // Commit changes
    // await session.commitTransaction();
    console.log(expense);
    console.log(expense.createdAt);
    console.log(user);
    console.log(user.timezone);
    console.log(dayjs.tz(expense.createdAt, user.timezone));
    callback(null, {
      expense: {
        _id: expense._id,
        description: expense.description,
        amount: getFormattedAmountWithCurrency(currency.symbol, expense.amount),
        time: dayjs.tz(expense.createdAt, user.timezone).format("lll"),
        paidByUserName: capitalizeFirstLetter(user.name),
        image: user.image,
        user_id: user._id,
        comments: [],
      },
      success: true,
    });
  } catch (error) {
    // Undo changes
    // await session.abortTransaction();
    console.log(error);
    callback(null, {
      errorMessage: error,
      success: false,
    });
    return;
  } finally {
    // session.endSession();
  }
};

exports.handle_request = handle_request;
