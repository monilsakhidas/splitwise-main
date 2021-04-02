const models = require("../../models/modelsStore");
const config = require("../../configuration/config");

const handle_request = async (req, callback) => {
  const user = await models.users
    .findOne({ _id: req.user._id })
    .populate("currencyId");
  callback(null, {
    email: user.email,
    name: user.name,
    timezone: user.timezone,
    language: user.language,
    number: user.number,
    image: user.image,
    currency: user.currencyId,
    success: true,
  });
};

exports.handle_request = handle_request;
