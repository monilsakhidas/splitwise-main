import axios from "axios";
import config from "../../config/config";
import cookie from "react-cookies";
import utils from "../../utils/utils";
import {
  LOGIN,
  SIGNUP,
  UPDATE_USER_PROFILE,
  CREATE_GROUP,
  EDIT_GROUP,
  ADD_COMMENT,
  ADD_EXPENSE,
  DELETE_COMMENT,
  GET_GROUP_DETAILS,
  GET_RECENT_ACTIVITY,
} from "../constants/actionTypes";

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
      } else if (action.type === CREATE_GROUP) {
        try {
          const response = await axios.post(
            config.BACKEND_URL + "/groups/create",
            action.payload,
            {
              headers: Object.assign(
                utils.getJwtHeader(cookie.load("jwtToken")),
                utils.getFormDataHeader
              ),
            }
          );
          if (response.status === 200) {
            action.payload = response.data;
          }
        } catch (error) {
          action.payload = {
            error: true,
            errorMessage: error.response.data.errorMessage,
          };
        }
      } else if (action.type === EDIT_GROUP) {
        try {
          const response = await axios.put(
            config.BACKEND_URL + "/groups/editgroup",
            action.payload,
            {
              headers: Object.assign(
                utils.getJwtHeader(cookie.load("jwtToken")),
                utils.getFormDataHeader
              ),
            }
          );
          if (response.status === 200) {
            action.payload = Object.assign(response.data, {
              error: false,
              errorMessage: null,
            });
          }
        } catch (error) {
          if (error.response) {
            action.payload = {
              error: true,
              errorMessage: error.response.data.errorMessage,
            };
          } else {
            console.log(error);
          }
        }
      } else if (action.type === GET_GROUP_DETAILS) {
        try {
          // group balance api
          const groupBalanceResponse = await axios.get(
            config.BACKEND_URL + "/groups/groupbalance/" + action.payload,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          // group expenses api
          const groupExpenseResponse = await axios.get(
            config.BACKEND_URL + "/groups/expenses/" + action.payload,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          // group debts api
          const groupDebtsResponse = await axios.get(
            config.BACKEND_URL + "/groups/debts/" + action.payload,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          // set group balances in state
          action.payload = {
            _id: action.payload,
            groupBalances: groupBalanceResponse.data.groupBalances,
            groupExpenses: groupExpenseResponse.data.expenses,
            groupDebts: groupDebtsResponse.data.loans,
          };
        } catch (error) {
          console.log(error);
        }
      } else if (action.type === ADD_COMMENT) {
        try {
          const response = await axios.post(
            config.BACKEND_URL + "/groups/addcomment",
            action.payload,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          if (response.status === 200) {
            action.payload = {
              ...action.payload,
              ...response.data.comment,
            };
          }
        } catch (error) {
          //console.log(response);
          console.log(error);
          if (error.response) {
            action.payload = {
              error: true,
              errorMessage: error.response.data.errorMessage,
            };
          } else {
            console.log(error);
          }
        }
      } else if (action.type === ADD_EXPENSE) {
        try {
          console.log("INSIDE ADD EXPENSE");
          const response = await axios.post(
            config.BACKEND_URL + "/groups/addexpense",
            action.payload,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          // group balance api
          const groupBalanceResponse = await axios.get(
            config.BACKEND_URL +
              "/groups/groupbalance/" +
              action.payload.group_id,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
          // group debts api
          const groupDebtsResponse = await axios.get(
            config.BACKEND_URL + "/groups/debts/" + action.payload.group_id,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );

          console.log("ADTEr CALLING ALL THE APIS");
          action.payload = {
            expenses: response.data.expense,
            balances: groupBalanceResponse.data.groupBalances,
            loans: groupDebtsResponse.data.loans,
          };
          console.log(action.payload);
        } catch (error) {
          console.log(error);
        }
      } else if (action.type === DELETE_COMMENT) {
        try {
          const response = await axios.post(
            config.BACKEND_URL + "/groups/removecomment",
            action.payload,
            {
              headers: utils.getJwtHeader(cookie.load("jwtToken")),
            }
          );
          if (response.status === 200) {
            // do nothing
          }
        } catch (error) {
          console.log(error);
        }
      } else if (action.type === GET_RECENT_ACTIVITY) {
        // group_id, pageSize, pageNumber, orderBy
        let activitiesResponse = null;
        if (action.payload.selectedGroupId === 0) {
          activitiesResponse = await axios.get(
            config.BACKEND_URL +
              "/users/activity?" +
              "&orderBy=" +
              action.payload.selectedOrder +
              "&pageSize=" +
              action.payload.selectedPageSize +
              "&pageNumber=" +
              action.payload.selectedPageNumber,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
        } else {
          activitiesResponse = await axios.get(
            config.BACKEND_URL +
              "/users/activity?" +
              "group_id=" +
              action.payload.selectedGroupId +
              "&orderBy=" +
              action.payload.selectedOrder +
              "&pageSize=" +
              action.payload.selectedPageSize +
              "&pageNumber=" +
              action.payload.selectedPageNumber,
            { headers: utils.getJwtHeader(cookie.load("jwtToken")) }
          );
        }
        action.payload = {
          activities: activitiesResponse.data.recentActivities,
          totalPages: activitiesResponse.data.totalPages,
        };
      } else {
        console.log("Inside middleware else");
      }
      return next(action);
    };
  };
}
