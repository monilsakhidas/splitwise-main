const config = require("../../configuration/config");
const models = require("../../models/modelsStore");
const mongoose = require("mongoose");
const handle_request = async (req, callback) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // Set updated image path
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.path.substring(req.file.path.indexOf("/") + 1);
    }

    // Find and verify the user count
    const users = await models.users.find({ _id: { $in: req.body.users } });
    if (users.length != req.body.users.length) {
      callback(null, {
        errorMessage: "Select valid users",
        success: false,
      });
      return;
    }

    // Initialize group
    const rawGroup = new models.groups({
      createdBy: req.user._id,
      name: req.body.name,
      image: imagePath,
      members: [req.user._id],
    });
    // Save group
    const group = await rawGroup.save();

    // Add invites (users)
    await users.forEach(async (user) => {
      if (user.invites && user.invites.length == 0) {
        user.invites = [group._id];
      } else {
        user.invites = [group._id, ...user.invites];
      }
      await user.save();
    });

    // Create the admin a default member of the group
    const x = await models.users.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: {
          memberships: group._id,
        },
      },
      { new: true }
    );
    callback(null, {
      _id: group._id,
      name: group.name,
      createdBy: group.createdBy,
      members: group.members,
      success: true,
    });
    await session.endSession();
    return;
  } catch (error) {
    await session.abortTransaction();
    if (error.code === config.databaseErrorCodes.uniqueKeyConstraintError) {
      callback(null, {
        errorMessage: "Group with this name already exists.",
        success: false,
      });
      return;
    } else if (error.kind == "ObjectId") {
      callback(null, {
        errorMessage: "Select valid users",
        success: false,
      });
      return;
    }
    console.log(error);
    callback(null, {
      errorMessage: error,
      success: false,
    });
  }
};
exports.handle_request = handle_request;
