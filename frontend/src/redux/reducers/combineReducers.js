import { combineReducers } from "redux";
import userProfileReducer from "./userProfileReducer";
import groupInfoReducer from "./groupInfoReducer";
import editGroupReducer from "./editGroupReducer";
import groupDetailsReducer from "./groupDetailsReducer";
import recentActivityReducer from "./recentActivityReducer";
import dashboardReducer from "./dashboardReducer";

export default combineReducers({
  userProfileReducer,
  groupInfoReducer,
  editGroupReducer,
  groupDetailsReducer,
  recentActivityReducer,
  dashboardReducer,
});
