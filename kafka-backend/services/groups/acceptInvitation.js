const models = require("../../models/modelsStore");
const handle_request = async (req, callback) => {
  // Find the user and make him a member
  const user = await models.users.findById(req.user._id);

  // Find whether the user was invited or not
  if (user.invites && user.invites.indexOf(req.body._id) !== -1) {
    // Removing the group_id from invites
    user.invites.splice(user.invites.indexOf(req.body._id), 1);

    // Adding this groupId into memberships
    if (user.memberships) {
      user.memberships = [req.body._id, ...user.memberships];
    } else {
      user.memberships = [req.body._id];
    }

    // Saving User
    const updatedUser = await user.save();

    // Adding the userId of the logged in user to the members field of the group
    const group = await models.groups.findById(req.body._id);
    if (group.members) {
      group.members.push(req.user._id);
    } else {
      group.members = [req.user._id];
    }

    // Saving the group
    const updatedGroup = await group.save();

    callback(null, {
      userMemberships: updatedUser.memberships,
      group_id: updatedGroup._id,
      groupMembers: updatedGroup.members,
      success: true,
    });
    return;
  } else {
    callback(null, { errorMessage: "Select a valid group", success: false });
    return;
  }
  // Find the group and update it
};

exports.handle_request = handle_request;
