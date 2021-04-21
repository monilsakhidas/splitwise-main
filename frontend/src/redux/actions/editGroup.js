import { EDIT_GROUP, SET_ERROR_EDIT_GROUP } from "../constants/actionTypes";

export const editGroup = (payload) => {
  return { type: EDIT_GROUP, payload };
};

export const setError = (payload) => {
  return { type: SET_ERROR_EDIT_GROUP, payload };
};
