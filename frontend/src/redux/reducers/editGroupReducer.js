import { EDIT_GROUP, SET_ERROR_EDIT_GROUP } from "../constants/actionTypes";

const initialState = {
  _id: null,
  name: null,
  image: null,
  error: null,
  errorMessage: null,
};

const editGroupReducer = (state = initialState, action) => {
  if (action.type === EDIT_GROUP) {
    if (!action.payload.error) {
      return {
        ...state,
        _id: action.payload._id,
        name: action.payload.name,
        image: action.payload.image,
        error: false,
        errorMessage: null,
      };
    } else {
      return {
        ...state,
        _id: null,
        name: null,
        image: null,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage,
      };
    }
  } else if (action.type === SET_ERROR_EDIT_GROUP) {
    return {
      ...state,
      error: action.payload.error,
      errorMessage: action.payload.errorMessage,
    };
  }
  return state;
};

export default editGroupReducer;
