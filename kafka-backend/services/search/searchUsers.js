const config = require("../../configuration/config");
const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  models.users
    .find(
      {
        $and: [
          {
            $or: [
              { name: { $regex: ".*" + req.query.keyword + ".*" } },
              { email: { $regex: ".*" + req.query.keyword + ".*" } },
            ],
          },
          { _id: { $ne: req.user._id } },
        ],
      },
      "name email"
    )
    .limit(config.searchLimit)
    .then((users) => callback(null, { users, success: true }))
    .catch((error) => callback(null, { errorMessage: error, success: false }));
};
exports.handle_request = handle_request;
