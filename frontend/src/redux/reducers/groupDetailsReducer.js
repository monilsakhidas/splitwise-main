import {
  ADD_COMMENT,
  ADD_EXPENSE,
  DELETE_COMMENT,
  GET_GROUP_DETAILS,
  SET_ERROR_ADD_COMMENT,
} from "../constants/actionTypes";
import utils from "../../utils/utils";

const initialState = {
  _id: null,
  name: null,
  groupBalances: [],
  groupExpenses: [],
  groupDebts: [],
  error: null,
  errorMessage: null,
};

const groupDetailsReducer = (state = initialState, action) => {
  if (action.type === GET_GROUP_DETAILS) {
    return {
      ...state,
      ...action.payload,
    };
  } else if (action.type === ADD_EXPENSE) {
    state.groupExpenses.unshift(action.payload);
    return {
      ...state,
      groupExpenses: [...state.groupExpenses],
    };
  } else if (action.type === ADD_COMMENT) {
    const expenseIndex = utils.findIndexInArray(
      action.payload.expense_id,
      state.groupExpenses
    );
    state.groupExpenses[expenseIndex].comments.push({
      _id: action.payload._id,
      time: action.payload.time,
      comment: action.payload.comment,
      commentedByUser_id: action.payload.commentedByUser_id,
      commentedByUserName: "You",
    });
    //const newGroupExpenses = state.groupExpenses;
    return {
      ...state,
      groupExpenses: [...state.groupExpenses],
      error: false,
      errorMessage: null,
    };
  } else if (action.type === DELETE_COMMENT) {
    const expenseIndex = utils.findIndexInArray(
      action.payload.expense_id,
      state.groupExpenses
    );

    const commentIndex = utils.findIndexInArray(
      action.payload.comment_id,
      state.groupExpenses[expenseIndex].comments
    );

    state.groupExpenses[expenseIndex].comments.splice(commentIndex, 1);

    return {
      ...state,
      groupExpenses: [...state.groupExpenses],
      error: false,
      errorMessage: null,
    };
  } else if (action.type === SET_ERROR_ADD_COMMENT) {
    return {
      ...state,
      error: action.payload.error,
      errorMessage: action.payload.errorMessage,
    };
  }
  return state;
};

export default groupDetailsReducer;
