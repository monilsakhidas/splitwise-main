const models = require("../../models/modelsStore");
const { settleUpTheUsers } = require("../../helpers/utils");
const handle_request = async (req, callback) => {
  // userId1 is the smaller userId
  // userId2 is the larger userId
  const [user1, user2] =
    req.user._id < req.body._id
      ? [req.user._id, req.body._id]
      : [req.body._id, req.user._id];

  // Check if the user has any association in any group with the selected user
  const rawUserDebts = await models.debts.find({
    user1,
    user2,
    amount: {
      $ne: 0,
    },
  });

  // If rawUserDebts is empty than return with bad request
  // as there is no asscoiation between the two users
  if (rawUserDebts.length == 0) {
    callback(null, {
      errorMessage:
        "Select a valid user with whom the accounts are not settled.",
      success: false,
    });
    return;
  }

  // How much debt is there between these 2 users
  // in every group and in every currency
  try {
    await rawUserDebts.forEach(async (rawDebt, index) => {
      await settleUpTheUsers(rawDebt);
      if (index == rawUserDebts.length - 1) {
        callback(null, {
          message: "Successfully settled up",
          success: true,
        });
        return;
      }
    });
  } catch (error) {
    callback(null, { errorMessage: error, success: false });
    return;
  }
};
exports.handle_request = handle_request;
