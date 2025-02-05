const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];
const user = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://makhmudovs50:${password}@cluster0.9bc0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

//if no user and number show the current collection
if (!user && !number) {
    Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
} else {
  const contact = new Person({
    name: user,
    number: number,
  });

  contact.save().then((result) => {
    console.log("note saved!");
    mongoose.connection.close();
  });
}
