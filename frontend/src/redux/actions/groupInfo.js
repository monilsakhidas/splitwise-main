import { CREATE_GROUP, SET_ERROR_GROUP_INFO } from "../constants/actionTypes";

export const createGroup = (payload) => {
  return { type: CREATE_GROUP, payload };
};

export const setError = (payload) => {
  return { type: SET_ERROR_GROUP_INFO, payload };
};
