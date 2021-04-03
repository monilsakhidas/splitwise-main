const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  models.users
    .findById(req.user._id)
    .then((user) => {
      // Check whether the user is member of the group or not
      if (user.memberships.includes(req.params.id)) {
        models.groups
          .findById(req.params.id)
          .then((group) => {
            callback(null, { group, success: true });
          })
          .catch((error) => {
            callback(null, { errorMessage: error, success: false });
            return;
          });
      } else {
        callback(null, {
          errorMessage: "Select a valid group",
          success: false,
        });
      }
    })
    .catch((error) => {
      callback(null, { errorMessage: error, success: false });
      return;
    });
};

exports.handle_request = handle_request;
