"use strict";
const config = require("./configuration/config");

// Connection
const connection = require("./kafka/connection");

// Topic names
const {
  USER_LOGIN,
  USER_SIGNUP,
  GET_USER_PROFILE,
  UPDATE_USER_PROFILE,
  GET_ALL_CURRENCIES,
  SEARCH_USERS,
  GROUP_CREATE,
  GROUP_UPDATE_DETAILS,
  SEARCH_GROUPS,
  GET_GROUP_DETAILS,
  GROUP_ACCEPT_INVITATION,
  GROUP_DECLINE_INVITATION,
  GET_USER_INVITATIONS,
  GROUP_ADD_EXPENSE,
} = require("./kafka/topics");

// Topics

// Users
const userLogin = require("./services/users/userLogin");
const userSignup = require("./services/users/userSignup");
const userProfileGet = require("./services/users/userProfileGet");
const userProfileUpdate = require("./services/users/userProfileUpdate");
const userInvitationsGet = require("./services/users/userInvitationsGet");
// Groups
const groupCreate = require("./services/groups/createGroup");
const groupUpdate = require("./services/groups/updateGroupDetails");
const myGroups = require("./services/groups/myGroups");
const getGroupDetails = require("./services/groups/getGroupDetails");
const groupAcceptInvitation = require("./services/groups/acceptInvitation");
const groupDeclineInvitation = require("./services/groups/declineInvitation");
const groupAddExpense = require("./services/groups/addExpense");
// Currencies
const getAllCurrencies = require("./services/masters/getAllCurrencies");

// Search
const searchUsers = require("./services/search/searchUsers");

// MongoDB Connection
const mongoose = require("./configuration/database");

function handleTopicRequest(topic_name, fname) {
  //var topic_name = 'root_topic';
  var consumer = connection.getConsumer(topic_name);
  var producer = connection.getProducer();
  console.log("server is running ");
  consumer.on("message", function (message) {
    console.log("message received for " + topic_name + " ", fname);
    console.log(JSON.stringify(message.value));
    var data = JSON.parse(message.value);

    fname.handle_request(data.data, function (err, res) {
      console.log("after handle" + res);
      var payloads = [
        {
          topic: data.replyTo,
          messages: JSON.stringify({
            correlationId: data.correlationId,
            data: res,
          }),
          partition: 0,
        },
      ];
      producer.send(payloads, function (err, data) {
        console.log(data);
      });
      return;
    });
  });
}

// Topics
//first argument is topic name
//second argument is a function that will handle this topic request
handleTopicRequest(USER_SIGNUP, userSignup);
handleTopicRequest(USER_LOGIN, userLogin);
handleTopicRequest(GET_USER_PROFILE, userProfileGet);
handleTopicRequest(UPDATE_USER_PROFILE, userProfileUpdate);
handleTopicRequest(GET_ALL_CURRENCIES, getAllCurrencies);
handleTopicRequest(SEARCH_USERS, searchUsers);
handleTopicRequest(GROUP_CREATE, groupCreate);
handleTopicRequest(GROUP_UPDATE_DETAILS, groupUpdate);
handleTopicRequest(SEARCH_GROUPS, myGroups);
handleTopicRequest(GET_GROUP_DETAILS, getGroupDetails);
handleTopicRequest(GROUP_ACCEPT_INVITATION, groupAcceptInvitation);
handleTopicRequest(GROUP_DECLINE_INVITATION, groupDeclineInvitation);
handleTopicRequest(GET_USER_INVITATIONS, userInvitationsGet);
handleTopicRequest(GROUP_ADD_EXPENSE, groupAddExpense);
