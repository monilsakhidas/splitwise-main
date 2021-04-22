import { GET_RECENT_ACTIVITY } from "../constants/actionTypes";

export const getRecentActiviy = (payload) => {
  return { type: GET_RECENT_ACTIVITY, payload };
};
