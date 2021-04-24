import { GET_DASHBOARD_BALANCE, SETTLE_UP } from "../constants/actionTypes";

export const getDashboardBalance = (payload) => {
  return { type: GET_DASHBOARD_BALANCE, payload };
};

export const settleUp = (payload) => {
  return { type: SETTLE_UP, payload };
};
