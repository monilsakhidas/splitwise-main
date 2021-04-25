import {
  LOGIN,
  LOGOUT,
  SET_ERROR,
  SIGNUP,
  UPDATE_USER_PROFILE,
} from "../constants/actionTypes";
import utils from "../../utils/utils";

const initialState = {
  jwtToken: null,
  loggedInUser: {
    _id: null,
    name: null,
    email: null,
    image: null,
    timezone: null,
    currency: null,
    number: null,
    language: null,
    message: null,
  },
  error: null,
  errorMessage: null,
};

const userProfileReducer = (state = initialState, action) => {
  if (action.type === LOGIN) {
    if (!action.payload.error) {
      return {
        ...state,
        jwtToken: action.payload.token,
        loggedInUser: {
          _id: action.payload.user._id,
          name: action.payload.user.name,
          email: action.payload.user.email,
          image: utils.getProfileImageUrl(action.payload.user.image),
          timezone: action.payload.user.timezone,
          currency: action.payload.user.currencyId,
          number: action.payload.user.number,
          language: action.payload.user.language,
        },
        errorMessage: null,
        error: false,
      };
    } else {
      return {
        ...state,
        jwtToken: null,
        loggedInUser: {
          _id: null,
          name: null,
          email: null,
          image: null,
          timezone: null,
          currency: null,
          number: null,
          language: null,
        },
        errorMessage: action.payload.errorMessage,
        error: true,
      };
    }
  } else if (action.type === LOGOUT) {
    //localStorage.removeItem("state");
    console.log("INSIDE USER PROFILE LOGUt REDUCEr");
    return {
      jwtToken: null,
      loggedInUser: {
        _id: null,
        name: null,
        email: null,
        image: null,
        timezone: null,
        currency: null,
        number: null,
        language: null,
      },
      errorMessage: null,
      error: null,
    };
  } else if (action.type === SIGNUP) {
    if (!action.payload.error) {
      return {
        ...state,
        jwtToken: action.payload.token,
        loggedInUser: {
          _id: action.payload.user._id,
          name: action.payload.user.name,
          email: action.payload.user.email,
          image: utils.getProfileImageUrl(action.payload.user.image),
          timezone: action.payload.user.timezone,
          currency: action.payload.user.currencyId,
          number: action.payload.user.number,
          language: action.payload.user.language,
        },
        errorMessage: null,
        error: false,
      };
    } else {
      return {
        ...state,
        jwtToken: null,
        loggedInUser: {
          _id: null,
          name: null,
          email: null,
          image: null,
          timezone: null,
          currency: null,
          number: null,
          language: null,
        },
        errorMessage: action.payload.errorMessage,
        error: true,
      };
    }
  } else if (action.type === UPDATE_USER_PROFILE) {
    if (!action.payload.error) {
      return {
        ...state,
        loggedInUser: {
          name: action.payload.name,
          email: action.payload.email,
          image: utils.getProfileImageUrl(action.payload.image),
          timezone: action.payload.timezone,
          number: action.payload.number,
          currency: action.payload.currency,
          language: action.payload.language,
        },
        message: action.payload.message,
      };
    } else if (!action.payload.tokenState) {
      return {
        ...state,
        jwtToken: null,
        loggedInUser: {
          _id: null,
          name: null,
          email: null,
          image: null,
          timezone: null,
          currency: null,
          number: null,
          language: null,
        },
        error: null,
        errorMessage: null,
        message: null,
      };
    } else if (action.payload.error) {
      return {
        ...state,
        error: true,
        errorMessage: action.payload.errorMessage,
        message: null,
      };
    }
  } else if (action.type === SET_ERROR) {
    return {
      ...state,
      error: action.payload.error,
      errorMessage: action.payload.errorMessage,
      message: null,
    };
  }
  return state;
};

export default userProfileReducer;
