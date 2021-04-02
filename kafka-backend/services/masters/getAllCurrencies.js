const models = require("../../models/modelsStore");
const handle_request = (req, callback) => {
  models.currencies
    .find({})
    .then((currencyList) => {
      callback(null, { currencyList, success: true });
      return;
    })
    .catch((error) => {
      callback(null, { errorMessage: err, success: false });
      return;
    });
};
exports.handle_request = handle_request;
