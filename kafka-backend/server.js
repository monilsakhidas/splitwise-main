"use strict";
const config = require("./configuration/config");

// Connection
const connection = require("./kafka/connection");

// Topic names
const {
  USER_LOGIN,
  USER_SIGNUP,
  GET_ALL_CURRENCIES,
} = require("./kafka/topics");

// Topics

// Users
const userLogin = require("./services/users/userLogin");
const userSignup = require("./services/users/userSignup");
// Groups

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
