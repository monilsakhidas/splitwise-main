const models = require("../../models/modelsStore");
const config = require("../../configuration/config");

const handle_request = async (req, callback) => {
  // find Image path of the updated Image. If image is not updated set it to the original image
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path.substring(req.file.path.indexOf("/") + 1);
  } else if (req.body.image) {
    imagePath = req.body.image;
  }
  // Update user profile
  models.users
    .findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          name: req.body.name,
          language: req.body.language,
          email: req.body.email,
          number: req.body.number,
          timezone: req.body.timezone,
          currencyId: req.body.currencyId,
          image: imagePath,
        },
      },
      { new: true }
    )
    .populate("currencyId")
    .then((updatedUser) => {
      callback(null, {
        language: updatedUser.language,
        email: updatedUser.email,
        number: updatedUser.number,
        timezone: updatedUser.timezone,
        currency: updatedUser.currencyId,
        success: true,
      });
      return;
    })
    .catch((err) => {
      if (err.code === config.databaseErrorCodes.uniqueKeyConstraintError) {
        callback(null, {
          errorMessage: "This email is already used. Please use another email",
          success: false,
        });
      } else {
        callback(null, { errorMessage: err, success: false });
      }
    });
};

exports.handle_request = handle_request;
