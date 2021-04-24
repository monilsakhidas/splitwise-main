import { GET_DASHBOARD_BALANCE, SETTLE_UP } from "../constants/actionTypes";

const initialState = {
  areYouOwedFlag: false,
  doYouOweFlag: false,
  youOweTotal: "",
  youGetTotal: "",
  totalBalance: "",
  youOwe: {},
  youAreOwed: {},
};

const dashboardReducer = (state = initialState, action) => {
  if (action.type === GET_DASHBOARD_BALANCE) {
    return {
      ...state,
      areYouOwedFlag: action.payload.areYouOwedFlag,
      doYouOweFlag: action.payload.doYouOweFlag,
      youOwe: action.payload.youOwe,
      youAreOwed: action.payload.doYouOwe,
      youOweTotal: action.payload.youOweTotal,
      youGetTotal: action.payload.youGetTotal,
      totalBalance: action.payload.totalBalance,
    };
  } else if (action.type === SETTLE_UP) {
    return {
      ...state,
      areYouOwedFlag: action.payload.areYouOwedFlag,
      doYouOweFlag: action.payload.doYouOweFlag,
      youOwe: action.payload.youOwe,
      youAreOwed: action.payload.doYouOwe,
      youOweTotal: action.payload.youOweTotal,
      youGetTotal: action.payload.youGetTotal,
      totalBalance: action.payload.totalBalance,
    };
  }
  return state;
};

export default dashboardReducer;
