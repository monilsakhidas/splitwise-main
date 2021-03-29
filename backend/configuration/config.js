"use strict";

const config = {
  frontendUrl: "http://localhost:3000",
  mongodbUri:
    "mongodb+srv://root:root@main-cluster.pxoxr.mongodb.net/Splitwise?retryWrites=true&w=majority",
  defaultCurrencyId: "606107f029b01d5779070a73",
  jwtSecretKey: "secretKey",
  jwtExpiryTime: 120000,
  databaseErrorCodes: {
    uniqueKeyConstraintError: 11000,
  },
};

module.exports = config;
