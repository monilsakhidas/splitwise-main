const models = require("../../models/modelsStore");
const {
  getFormattedAmountWithCurrency,
  capitalizeFirstLetter,
} = require("../../helpers/utils");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // dependent on utc plugin
const timezone = require("dayjs/plugin/timezone");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const handle_request = async (req, callback) => {
  // Find group instance
  const group = await models.groups.findById(req.params.id).populate({
    path: "expenses",
    populate: [
      {
        path: "paidByUser",
        select: "name image",
      },
      {
        path: "currency",
        select: "symbol",
      },
      {
        path: "comments.commentedByUser",
        select: "name",
      },
    ],
  });
  if (group == null || !group.members.includes(req.user._id)) {
    callback(null, { errorMessage: "Select a valid group.", success: false });
    return;
  }
  const loggedInUser = await models.users.findById(req.user._id);
  const sortedExpenses = group.expenses
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((expense) => {
      const comments = expense.comments.map((comment) => {
        return {
          _id: comment._id,
          commentedByUser_id: comment.commentedByUser._id,
          commentedByUserName: capitalizeFirstLetter(
            comment.commentedByUser.name
          ),
          comment: comment.comment,
          time: dayjs
            .tz(comment.createdAt, loggedInUser.timezone)
            .format("lll"),
        };
      });
      return {
        _id: expense._id,
        description: expense.description,
        amount: getFormattedAmountWithCurrency(
          expense.currency.symbol,
          String(expense.amount)
        ),
        paidByUserName: capitalizeFirstLetter(expense.paidByUser.name),
        image: expense.paidByUser.image || null,
        user_id: expense.paidByUser._id,
        time: dayjs.tz(expense.createdAt, loggedInUser.timezone).format("lll"),
        comments,
      };
    });

  //   const timezone = loggedInUser.timezone;
  callback(null, { group: sortedExpenses, success: true });
  // Get All expenses of the group
};

exports.handle_request = handle_request;
