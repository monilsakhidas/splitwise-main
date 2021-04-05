const getIndexOfGroupBalancesArray = (user_id, currency_id, groupBalances) => {
  if (!groupBalances || groupBalances.length == 0) {
    return -1;
  } else {
    for (let i = 0; i < groupBalances.length; i++) {
      if (
        groupBalances[i].user.equals(user_id) &&
        groupBalances[i].currency.equals(currency_id)
      ) {
        return i;
      }
    }
    return -1;
  }
};

const utils = {
  getIndexOfGroupBalancesArray,
};

module.exports = utils;
