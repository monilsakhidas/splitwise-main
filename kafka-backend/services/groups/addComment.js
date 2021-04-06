const models = require("../../models/modelsStore");
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
    // Find the expense
    const rawExpense = await models.expenses.findById(req.body.expense_id);
    rawExpense.comments.push({
      commentedByUser: req.user._id,
      comment: req.body.comment,
    });
    const expense = await rawExpense.save();
    callback(null, {
      comment: expense.comments[expense.comments.length - 1],
      success: true,
    });
    return;
  }
};
exports.handle_request = handle_request;
