import { combineReducers } from "redux";
import userProfileReducer from "./userProfileReducer";
import groupInfoReducer from "./groupInfoReducer";
import editGroupReducer from "./editGroupReducer";
import groupDetailsReducer from "./groupDetailsReducer";

export default combineReducers({
  userProfileReducer,
  groupInfoReducer,
  editGroupReducer,
  groupDetailsReducer,
});
