const models = require("../../models/modelsStore");
const { canUserLeaveTheGroup } = require("../../helpers/utils");
const handle_request = async (req, callback) => {
  // Find the user's instance
  const loggedInUser = await models.users.findById(req.user._id, "memberships");
  // Remove the group_id from memberships
  loggedInUser.memberships.splice(
    loggedInUser.memberships.indexOf(req.body._id)
  );

  // Find the group and check whether the user is a member or not
  const group = await models.groups.findById(
    req.body._id,
    "members groupBalances"
  );
  console.log(group);
  if (!group || !group.members.includes(req.user._id)) {
    callback(null, { errorMessage: "Select a valid group", success: false });
    return;
  }
  // If user is a member check whether he/she can leave the group or not
  if (canUserLeaveTheGroup(req.user._id, group.groupBalances)) {
    // Removing the user_id from members group
    group.members.splice(group.members.indexOf(req.user._id), 1);
    await group.save();
    await loggedInUser.save();
    callback(null, {
      message: "Left group successfully.",
      success: true,
    });
    return;
  } else {
    callback(null, {
      errorMessage:
        "You cannot leave this group until the group balances are not settled.",
      success: false,
    });
    return;
  }
  // If the user can leave the group then remove the user from the group by updating the database
};
exports.handle_request = handle_request;
