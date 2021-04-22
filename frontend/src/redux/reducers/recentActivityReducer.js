import { GET_RECENT_ACTIVITY } from "../constants/actionTypes";

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
  }
  return state;
};

export default recentActivityReducer;
