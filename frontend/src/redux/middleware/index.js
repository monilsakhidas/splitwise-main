import axios from "axios";
import config from "../../config/config";
import cookie from "react-cookies";
import utils from "../../utils/utils";
import { LOGIN, SIGNUP, UPDATE_USER_PROFILE } from "../constants/actionTypes";

export function splitwiseMiddleware({ dispatch }) {
  return function (next) {
    return async function (action) {
      console.log("in middleware");
      if (action.type === LOGIN) {
        await axios
          .post(config.BACKEND_URL + "/users/login", action.payload)
          .then((res) => {
            if (res.status === 200) {
              // save jwtToken
              cookie.save("jwtToken", res.data.token, {
                path: "/",
                httponly: false,
                maxAge: 120000,
              });

              // save name
              cookie.save("name", res.data.user.name, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });

              // save email
              cookie.save("email", res.data.user.email, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });

              // save userId
              cookie.save("_id", res.data.user._id, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });

              action.payload = Object.assign(res.data, {
                error: false,
                errorMessage: null,
              });
            }
          })
          .catch((err) => {
            if (err.response) {
              action.payload = {
                error: true,
                errorMessage: err.response.data.errorMessage,
              };
            } else {
              console.log(err);
            }
          });
      } else if (action.type === SIGNUP) {
        await axios
          .post(config.BACKEND_URL + "/users/signup", action.payload)
          .then((res) => {
            if (res.status === 200) {
              cookie.save("jwtToken", res.data.token, {
                path: "/",
                httponly: false,
                maxAge: 120000,
              });
              // save name
              cookie.save("name", res.data.user.name, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });
              // save email
              cookie.save("email", res.data.user.email, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });
              // save userId
              cookie.save("id", res.data.user._id, {
                path: "/",
                httpOnly: false,
                maxAge: 120000,
              });

              action.payload = Object.assign(res.data, {
                error: false,
                errorMessage: null,
              });
            }
          })
          .catch((err) => {
            if (err.response) {
              action.payload = {
                error: true,
                errorMessage: err.response.data.errorMessage,
              };
            } else {
              console.log(err);
            }
          });
      } else if (action.type === UPDATE_USER_PROFILE) {
        await axios
          .put(config.BACKEND_URL + "/users/profile", action.payload, {
            headers: Object.assign(
              utils.getJwtHeader(cookie.load("jwtToken")),
              utils.getFormDataHeader()
            ),
          })
          .then((res) => {
            if (res.status === 200) {
              console.log("INSIDE RESPONSE 200");
              console.log(cookie.load("name"));
              console.log(action.payload.get("name"));
              // Update cookies
              if (cookie.load("email") !== action.payload.get("email")) {
                cookie.remove("email", {
                  path: "/",
                });
                cookie.save("email", action.payload.get("email"), {
                  path: "/",
                  httpOnly: false,
                  maxAge: 120000,
                });
              }
              if (cookie.load("name") !== action.payload.get("name")) {
                console.log("INSIDE COOKIE CHANGE");
                cookie.remove("name", {
                  path: "/",
                });
                cookie.save("name", action.payload.get("name"), {
                  path: "/",
                  httpOnly: false,
                  maxAge: 120000,
                });
              }
              action.payload = Object.assign(res.data, {
                error: false,
                errorMessage: null,
                message: "Profile saved successfully",
                tokenState: true,
              });
            }
          })
          .catch((error) => {
            if (error.response && error.response.status === 401) {
              action.payload = {
                tokenState: false,
                error: true,
                errorMessage: null,
                message: null,
              };
            } else if (error.response && error.response.status === 400) {
              action.payload = {
                error: true,
                errorMessage: error.response.data.errorMessage,
                tokenState: true,
                message: null,
              };
            } else {
              console.log(error.response);
            }
          });
      } else {
        console.log("Inside middleware else");
      }
      return next(action);
    };
  };
}
