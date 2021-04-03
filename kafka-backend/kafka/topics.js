// Users
const USER_LOGIN = "userLogin";
const USER_SIGNUP = "userSignup";
const GET_USER_PROFILE = "userProfileGet";
const UPDATE_USER_PROFILE = "userProfileUpdate";
const GET_USER_INVITATIONS = "userInvitationsGet";

// Groups
const GROUP_CREATE = "groupCreate";
const GROUP_UPDATE_DETAILS = "groupDetailsUpdate"; // Update basic group details
const GROUP_ACCEPT_INVITATION = "groupAcceptInvitation"; // Accept invite
const GROUP_DECLINE_INVITATION = "groupDeclineInvitation"; // Reject invite
const GET_GROUP_DETAILS = "groupProfileGet";

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
};
