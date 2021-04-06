const models = require("../../models/modelsStore");
const config = require("../../configuration/config");
const {
  getRecentActivityDescription,
  get,
  getRecentActivityExpenseStatement,
} = require("../../helpers/utils");
const mongoose = require("mongoose");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // dependent on utc plugin
const timezone = require("dayjs/plugin/timezone");
const localizedFormat = require("dayjs/plugin/localizedFormat");
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const handle_request = async (req, callback) => {
  const pageSize = req.query.pageSize || config.defaultPageSize;
  const pageNumber = req.query.pageNumber;
  // 1 -> Desc, 2 -> Asc
  const orderByIdentifier =
    !req.query.orderBy || req.query.orderBy == 1 ? -1 : 1;
  let loggedInUser;
  console.log("ahjsbjhcbhjschjdsbchjsdbcjhsbcjhsdbchjs", req.query.group_id);
  if (req.query.group_id) {
    // Check whether the user is member of the inputted group or not
    loggedInUser = await models.users
      .findById(req.user._id, "activities")
      .populate({
        path: "activities",
        options: {
          sort: {
            createdAt: orderByIdentifier,
          },
          skip: (pageNumber - 1) * pageSize,
          limit: pageSize,
        },
        populate: [
          {
            path: "user",
            select: "name image",
          },
          {
            path: "currency",
            select: "symbol",
          },
          {
            path: "expense",
            select: "amount paidByUser description group transactionType",
            populate: [
              {
                path: "paidByUser",
                select: "name image",
              },
              {
                path: "transactionType",
                select: "name image",
              },
              {
                path: "group",
                select: "name",
              },
            ],
          },
        ],
        match: {
          group: mongoose.Types.ObjectId(req.query.group_id),
        },
      });
  } else {
    // Find the user instance
    loggedInUser = await models.users
      .findById(req.user._id, "activities")
      .populate({
        path: "activities",
        options: {
          sort: {
            createdAt: orderByIdentifier,
          },
          skip: (pageNumber - 1) * pageSize,
          limit: pageSize,
        },
        populate: [
          {
            path: "user",
            select: "name image",
          },
          {
            path: "currency",
            select: "symbol",
          },
          {
            path: "expense",
            select: "amount paidByUser description group transactionType",
            populate: [
              {
                path: "paidByUser",
                select: "name image",
              },
              {
                path: "transactionType",
                select: "name image",
              },
              {
                path: "group",
                select: "name",
              },
            ],
          },
        ],
      });
  }
  const recentActivitiesResponse = await loggedInUser.activities.map(
    (recentActivity) => {
      return {
        description: getRecentActivityDescription(recentActivity, req.user._id),
        expenseStatement: getRecentActivityExpenseStatement(recentActivity),
        image: recentActivity.expense.paidByUser.image || null,
        time: dayjs
          .tz(recentActivity.createdAt, loggedInUser.timezone)
          .format("lll"),
      };
    }
  );
  callback(null, { recentActivities: recentActivitiesResponse, success: true });
  return;
};
exports.handle_request = handle_request;
