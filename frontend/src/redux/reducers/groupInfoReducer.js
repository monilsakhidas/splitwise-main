import {
  CREATE_GROUP,
  EDIT_GROUP,
  SET_ERROR_GROUP_INFO,
  LOGOUT,
} from "../constants/actionTypes";
import utils from "../../utils/utils";

const initialState = {
  _id: null,
  name: null,
  members: null,
  image: null,
  error: null,
  errorMessage: null,
};

const groupInfoReducer = (state = initialState, action) => {
  if (action.type === CREATE_GROUP) {
    if (!action.payload.error) {
      return {
        ...state,
        _id: action.payload._id,
        name: action.payload.name,
        members: action.payload.members,
        image: action.payload.image,
        error: false,
        errorMessage: null,
      };
    } else {
      return {
        ...state,
        _id: null,
        name: null,
        members: null,
        image: null,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage,
      };
    }
  } else if (action.type === EDIT_GROUP) {
  } else if (action.type === SET_ERROR_GROUP_INFO) {
    return {
      ...state,
      error: action.payload.error,
      errorMessage: action.payload.errorMessage,
    };
  } else if (action.type === LOGOUT) {
    return {
      _id: null,
      name: null,
      members: null,
      image: null,
      error: null,
      errorMessage: null,
    };
  }
  return state;
};

export default groupInfoReducer;
