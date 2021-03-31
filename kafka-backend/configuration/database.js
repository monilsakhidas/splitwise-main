const mongoose = require("mongoose");
const config = require("./config");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  poolSize: 500,
  bufferMaxEntries: 0,
};

mongoose.connect(config.mongodbUri, options, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MongoDB Connected");
  }
});

module.exports = mongoose;
