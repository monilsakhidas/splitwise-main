const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  // Finding all groups whose user is a member
  models.users
    .findById(req.user._id)
    .populate("memberships")
    .then((user) =>
      callback(null, {
        groups: user.memberships,
        success: true,
      })
    )
    .catch((error) => {
      callback(null, {
        errorMessage: error,
        success: false,
      });
    });
};
exports.handle_request = handle_request;
