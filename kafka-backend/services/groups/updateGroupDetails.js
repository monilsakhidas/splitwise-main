const config = require("../../configuration/config");
const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  // Check whether the logged in user is a member of that group
  models.users.findById(req.user._id).then((user) => {
    if (user.memberships.includes(req.body._id)) {
      // Update image path if the image was uploaded
      let imagePath = null;
      if (req.file) {
        imagePath = req.file.path.substring(req.file.path.indexOf("/") + 1);
      }
      // Update the group details
      models.groups
        .findByIdAndUpdate(
          req.body._id,
          { name: req.body.name, image: imagePath },
          { new: true }
        )
        .then((updatedGroup) => {
          callback(null, {
            _id: updatedGroup._id,
            name: updatedGroup.name,
            image: updatedGroup.image,
            success: true,
          });
          return;
        })
        .catch((error) => {
          if (
            error.code &&
            error.code == config.databaseErrorCodes.uniqueKeyConstraintError
          ) {
            callback(null, {
              errorMessage: "Group with name already exists",
              success: false,
            });
            return;
          } else {
            callback(null, {
              errorMessage: error,
              success: false,
            });
            return;
          }
        });
    } else {
      callback(null, {
        errorMessage: "Select a valid group",
        success: false,
      });
      return;
    }
  });
};

exports.handle_request = handle_request;
