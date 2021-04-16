// Users
const USER_LOGIN = "userLogin";
const USER_SIGNUP = "userSignup";
const GET_USER_PROFILE = "userProfileGet";
const UPDATE_USER_PROFILE = "userProfileUpdate";
const GET_USER_INVITATIONS = "userInvitationsGet";
const GET_USER_SETTLE_UP_LIST = "userSettleUpList";
const SETTLE_UP_WITH_A_USER = "userSettleUp";
const GET_RECENT_ACTIVITY = "userRecentActivityGet";
const GET_USER_DEBTS = "userDebtsGet";
const GET_USER_DASHBOARD_BALANCE = "userDashboardBalanceGet";
// Groups
const GROUP_CREATE = "groupCreate";
const GROUP_UPDATE_DETAILS = "groupDetailsUpdate"; // Update basic group details
const GROUP_ACCEPT_INVITATION = "groupAcceptInvitation"; // Accept invite
const GROUP_DECLINE_INVITATION = "groupDeclineInvitation"; // Reject invite
const GET_GROUP_DETAILS = "groupProfileGet";
const GROUP_ADD_EXPENSE = "groupAddExpense";
const GET_GROUP_BALANCES = "groupBalancesGet";
const GET_GROUP_DEBTS = "groupDebtsGet";
const GET_GROUP_EXPENSES = "groupExpensesGet";
const ADD_COMMENTS_EXPENSE = "addCommentsExpense";
const DELETE_COMMENT_EXPENSE = "deleteCommentsExpense";
const GROUP_LEAVE = "groupLeave";
// Master
const GET_ALL_CURRENCIES = "currenciesGetAll";

// Search
const SEARCH_USERS = "searchUsers";
const SEARCH_GROUPS = "searchGroups";

module.exports = {
  USER_LOGIN,
  USER_SIGNUP,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  GET_ALL_CURRENCIES,
  SEARCH_USERS,
  GET_USER_INVITATIONS,
  GROUP_CREATE,
  GROUP_UPDATE_DETAILS,
  GROUP_ACCEPT_INVITATION,
  GROUP_DECLINE_INVITATION,
  GET_GROUP_DETAILS,
  SEARCH_GROUPS,
  GROUP_ADD_EXPENSE,
  GET_USER_SETTLE_UP_LIST,
  SETTLE_UP_WITH_A_USER,
  GET_GROUP_BALANCES,
  GET_GROUP_DEBTS,
  GET_GROUP_EXPENSES,
  GET_RECENT_ACTIVITY,
  ADD_COMMENTS_EXPENSE,
  DELETE_COMMENT_EXPENSE,
  GET_USER_DEBTS,
  GET_USER_DASHBOARD_BALANCE,
  GROUP_LEAVE,
};
