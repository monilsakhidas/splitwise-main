import { GET_RECENT_ACTIVITY, LOGOUT } from "../constants/actionTypes";

const initialState = {
  activities: [],
  totalPages: 0,
};

const recentActivityReducer = (state = initialState, action) => {
  if (action.type === GET_RECENT_ACTIVITY) {
    return {
      ...state,
      ...action.payload,
    };
  } else if (action.type === LOGOUT) {
    return {
      activities: [],
      totalPages: 0,
    };
  }
  return state;
};

export default recentActivityReducer;
