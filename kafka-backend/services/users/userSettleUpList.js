const models = require("../../models/modelsStore");
const { capitalizeFirstLetter } = require("../../helpers/utils");
const handle_request = async (req, callback) => {
  const userSet = new Set();
  const rawUserDebts = await models.debts.find({
    $and: [
      { amount: { $ne: 0 } },
      { $or: [{ user1: req.user._id }, { user2: req.user._id }] },
    ],
  });
  await rawUserDebts.forEach(async (rawDebt) => {
    userSet.add(String(rawDebt.user1));
    userSet.add(String(rawDebt.user2));
  });
  userSet.delete(req.user._id);
  const userList = Array.from(userSet);
  const rawUsers = await models.users.find(
    { _id: { $in: userList } },
    "name email"
  );

  const users = rawUsers.map((user) => {
    return {
      _id: user._id,
      email: user.email,
      name: capitalizeFirstLetter(user.name),
    };
  });
  callback(null, { success: true, users });
};
exports.handle_request = handle_request;
