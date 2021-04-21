const models = require("../../models/modelsStore");
const { capitalizeFirstLetter } = require("../../helpers/utils");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // dependent on utc plugin
const timezone = require("dayjs/plugin/timezone");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
const handle_request = async (req, callback) => {
  // Check whether the user can add the comment or not
  const group = await models.groups.findById(req.body.group_id);
  if (
    group == null ||
    !group.members.includes(req.user._id) ||
    !group.expenses.includes(req.body.expense_id)
  ) {
    callback(null, {
      errorMessage: "Select a valid group/expense.",
      success: false,
    });
    return;
  } else {
    // Find the loggedInUser
    const loggedInUser = await models.users.findById(
      req.user._id,
      "timezone name"
    );
    // Find the expense
    const rawExpense = await models.expenses.findById(req.body.expense_id);
    rawExpense.comments.push({
      commentedByUser: req.user._id,
      comment: req.body.comment,
    });
    const expense = await rawExpense.save();
    callback(null, {
      comment: {
        _id: expense.comments[expense.comments.length - 1]._id,
        comment: expense.comments[expense.comments.length - 1].comment,
        commentedByUser_id:
          expense.comments[expense.comments.length - 1].commentedByUser,
        commentedByUserName: capitalizeFirstLetter(loggedInUser.name),
        time: dayjs
          .tz(
            expense.comments[expense.comments.length - 1].createdAt,
            loggedInUser.timezone
          )
          .format("lll"),
      },
      success: true,
    });
    // callback(null, {
    //   comment: expense.comments[expense.comments.length - 1],
    //   success: true,
    // });
    return;
  }
};
exports.handle_request = handle_request;
