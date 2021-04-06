const models = require("../../models/modelsStore");
const handle_request = async (req, callback) => {
  // find the group
  const group = await models.groups.findById(req.body.group_id);
  if (
    group == null ||
    !group.members.includes(req.user._id) ||
    !group.expenses.includes(req.body.expense_id)
  ) {
    callback(null, {
      errorMessage: "Select a valid comment.",
      success: false,
    });
    return;
  } else {
    // find the expense
    const expense = await models.expenses.findById(req.body.expense_id);
    const oldLength = expense.comments.length;
    expense.comments = expense.comments.filter((comment) => {
      return !(
        comment._id == req.body.comment_id &&
        comment.commentedByUser == req.user._id
      );
    });
    if (expense.comments.length == oldLength) {
      callback(null, {
        errorMessage: "You can only delete a comment you made.",
        success: false,
      });
      return;
    } else {
      await expense.save();
      callback(null, {
        message: "Comment deleted successfully",
        success: true,
      });
      return;
    }
  }
};

exports.handle_request = handle_request;
