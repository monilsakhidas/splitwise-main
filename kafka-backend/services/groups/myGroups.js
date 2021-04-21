const models = require("../../models/modelsStore");
const { capitalizeFirstLetter } = require("../../helpers/utils");
const handle_request = (req, callback) => {
  // Finding all groups whose user is a member
  models.users
    .findById(req.user._id)
    .populate("memberships", "name image")
    .then((user) => {
      const memberships = user.memberships.map((membership) => {
        return {
          _id: membership._id,
          name: capitalizeFirstLetter(membership.name),
          image: membership.image,
        };
      });
      callback(null, {
        groups: memberships,
        success: true,
      });
    })
    .catch((error) => {
      callback(null, {
        errorMessage: error,
        success: false,
      });
    });
};
exports.handle_request = handle_request;
