import {
  LOGIN,
  LOGOUT,
  SIGNUP,
  SET_ERROR,
  UPDATE_USER_PROFILE,
} from "../constants/actionTypes";

export const login = (payload) => {
  return { type: LOGIN, payload };
};

export const logout = (payload) => {
  return { type: LOGOUT, payload };
};

export const signup = (payload) => {
  return { type: SIGNUP, payload };
};

export const updateUserProfile = (payload) => {
  return { type: UPDATE_USER_PROFILE, payload };
};

export const setError = (payload) => {
  return { type: SET_ERROR, payload };
};
