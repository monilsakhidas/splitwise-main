const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    const jwtToken = jwt.sign(user.toJSON(), config.jwtSecretKey, {
      expiresIn: config.jwtExpiryTime,
    });
    callback(null, {
      user,
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