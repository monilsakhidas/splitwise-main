const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { capitalizeFirstLetter } = require("../../helpers/utils");
const models = require("../../models/modelsStore");
const config = require("../../configuration/config");

const handle_request = async (req, callback) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());
  const userObject = {
    name: name,
    email: email,
    password: hashedPassword,
  };

  const rawUser = new models.users(userObject);
  try {
    const user = await rawUser.save();
    const userCurrency = await models.currencies.findById(
      user.currencyId,
      "symbol name"
    );
    user.currencyId = userCurrency;
    const jwtToken = jwt.sign(user.toJSON(), config.jwtSecretKey, {
      expiresIn: config.jwtExpiryTime,
    });
    const response = {
      currencyId: user.currencyId,
      timezone: user.timezone,
      language: user.language,
      name: capitalizeFirstLetter(user.name),
      email: user.email,
    };
    callback(null, {
      user: response,
      token: jwtToken,
      message: "Signed up successfully.",
      success: true,
    });
  } catch (error) {
    if (error.code === config.databaseErrorCodes.uniqueKeyConstraintError) {
      callback(null, {
        errorMessage: "Account belonging to this email already exists.",
        success: false,
      });
    } else {
      callback(null, {
        errorMessage: error,
        success: false,
      });
    }
  }
};

exports.handle_request = handle_request;
