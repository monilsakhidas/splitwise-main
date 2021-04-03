const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  models.users
    .findById(req.user._id)
    .populate("invites")
    .then((user) => {
      callback(null, { groups: user.invites, success: true });
      return;
    })
    .catch((error) => {
      callback(null, { errorMessage: error, success: false });
    });
};

exports.handle_request = handle_request;
