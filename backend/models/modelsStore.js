const Currency = require("./currency");
const User = require("./user");
const Group = require("./group");
const models = {
  currencies: Currency,
  users: User,
  groups: Group,
};
module.exports = models;
