const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const models = require("../../models/modelsStore");
const config = require("../../configuration/config");
const { capitalizeFirstLetter } = require("../../helpers/utils");

const handle_request = async (req, callback) => {
  // Check if the user with the input email exists
  models.users
    .findOne({
      email: req.body.email.toLowerCase(),
    })
    .populate("currencyId", "symbol name")
    .then(async (user) => {
      if (
        user == null ||
        !(await bcrypt.compare(req.body.password, user.password))
      ) {
        //res.status(400).send({ errorMessage: "Invalid email or password" });
        callback(null, {
          errorMessage: "Invalid email or password",
          success: false,
        });
      } else {
        let unsignedJwtUserObject = {
          _id: user._id,
          name: capitalizeFirstLetter(user.name),
          email: user.email,
          currencyId: user.currencyId,
        };
        // Generate a JWT token
        const jwtToken = jwt.sign(unsignedJwtUserObject, config.jwtSecretKey, {
          expiresIn: config.jwtExpiryTime,
        });

        unsignedJwtUserObject = Object.assign(unsignedJwtUserObject, {
          language: user.language,
          number: user.number,
          timezone: user.timezone,
          image: user.image,
        });

        console.log({
          user: unsignedJwtUserObject,
          token: jwtToken,
          message: "Logged in successfully.",
          success: true,
        });
        callback(null, {
          user: unsignedJwtUserObject,
          token: jwtToken,
          message: "Logged in successfully.",
          success: true,
        });
      }
    })
    .catch((err) => {
      callback(null, { errorMessage: err, success: false });
    });
};

exports.handle_request = handle_request;
