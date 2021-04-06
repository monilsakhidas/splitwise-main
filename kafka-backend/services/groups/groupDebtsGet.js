const models = require("../../models/modelsStore");
const {
  getFormattedAmountWithCurrency,
  capitalizeFirstLetter,
} = require("../../helpers/utils");

const handle_request = async (req, callback) => {
  // Find group instance
  const group = await models.groups.findById(req.params.id);

  if (group == null || !group.members.includes(req.user._id)) {
    callback(null, { errorMessage: "Select a valid group.", success: false });
    return;
  }

  // Find debts related to this group

  const debts = await models.debts
    .find({
      group: req.params.id,
      amount: { $ne: 0 },
    })
    .populate("user1", "name image")
    .populate("user2", "name image")
    .populate("currency", "symbol");
  console.log(debts);
  const loans = debts.map((debt) => {
    if (debt.amount > 0) {
      return {
        loaneeName: capitalizeFirstLetter(debt.user2.name),
        loaneeImage: debt.user2.image || null,
        loanerName: capitalizeFirstLetter(debt.user1.name),
        amount: getFormattedAmountWithCurrency(
          debt.currency.symbol,
          debt.amount
        ),
      };
    } else {
      return {
        loaneeName: capitalizeFirstLetter(debt.user1.name),
        loaneeImage: debt.user1.image,
        loanerName: capitalizeFirstLetter(debt.user2.name),
        amount: getFormattedAmountWithCurrency(
          debt.currency.symbol,
          -debt.amount
        ),
      };
    }
  });
  callback(null, { loans, success: true });
};

exports.handle_request = handle_request;
