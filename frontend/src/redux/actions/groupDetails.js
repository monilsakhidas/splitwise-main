import {
  ADD_COMMENT,
  ADD_EXPENSE,
  DELETE_COMMENT,
  GET_GROUP_DETAILS,
  SET_ERROR_ADD_COMMENT,
} from "../constants/actionTypes";

export const addComment = (payload) => {
  console.log("DISPACTHING THE ADD COMENT ACTION");
  return { type: ADD_COMMENT, payload };
};

export const deleteComment = (payload) => {
  return { type: DELETE_COMMENT, payload };
};

export const addExpense = (payload) => {
  return { type: ADD_EXPENSE, payload };
};

export const getGroupDetails = (payload) => {
  return { type: GET_GROUP_DETAILS, payload };
};

export const setError = (payload) => {
  return { type: SET_ERROR_ADD_COMMENT, payload };
};
