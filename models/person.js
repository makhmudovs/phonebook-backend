const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then((res) => {
    console.log("connected to Mongodb");
  })
  .catch((err) => {
    console.log("connection error MongoDb", err.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

module.exports = mongoose.model("Person", personSchema);
