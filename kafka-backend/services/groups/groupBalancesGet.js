const models = require("../../models/modelsStore");
const {
  getGroupBalanceStatement,
  capitalizeFirstLetter,
} = require("../../helpers/utils");
const handle_request = async (req, callback) => {
  // Find group instance
  let group = await models.groups
    .findById(req.params.id)
    .populate("groupBalances.user", "name image")
    .populate("groupBalances.currency", "symbol");

  // console.log(group);

  if (group == null || !group.members.includes(req.user._id)) {
    callback(null, { errorMessage: "Select a valid group.", success: false });
    return;
  } else {
    group.groupBalances = group.groupBalances.filter((groupBalance) => {
      return groupBalance.balance !== 0;
    });
    console.log(group);
    const groupBalances = group.groupBalances.map((groupBalance) => {
      return {
        name: capitalizeFirstLetter(groupBalance.user.name),
        user_id: groupBalance.user._id,
        groupStatement: getGroupBalanceStatement(
          groupBalance.balance,
          groupBalance.currency.symbol
        ),
        image: groupBalance.user.image || null,
      };
    });
    callback(null, { groupBalances, success: true });
  }
};
exports.handle_request = handle_request;
