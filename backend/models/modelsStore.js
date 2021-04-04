const Currency = require("./currency");
const User = require("./user");
const Group = require("./group");
const Activity = require("./activity");
const Debt = require("./debt");
const Comment = require("./comment");
const GroupBalance = require("./groupBalance");
const models = {
  currencies: Currency,
  users: User,
  groups: Group,
  activities: Activity,
  debts: Debt,
  comments: Comment,
  groupBalances: GroupBalance,
};
module.exports = models;
