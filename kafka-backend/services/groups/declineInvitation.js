const models = require("../../models/modelsStore");
const handle_request = async (req, callback) => {
  // Find the user and make him a member
  const user = await models.users.findById(req.user._id);

  // Find whether the user was invited or not
  if (user.invites && user.invites.indexOf(req.body._id) !== -1) {
    // Removing the group_id from invites
    user.invites.splice(user.invites.indexOf(req.body._id), 1);

    // Saving User
    const updatedUser = await user.save();

    callback(null, {
      userMemberships: updatedUser.memberships,
      group_id: req.body._id,
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
