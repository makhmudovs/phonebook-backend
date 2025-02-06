const express = require("express");
const morgan = require("morgan");
const app = express();
require("dotenv").config();

const Person = require("./models/person");

app.use(express.json());

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);
app.use(express.static("dist"));

let persons = [];

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/info", (req, res) => {
  res.send(`
    <div>
        <p>Phone book has info for ${persons.length} people</p>
        <p>${new Date.toLocaleString()}</p>
    </div>`);
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id).then((person) => {
    res.json(person);
  });
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.post("/api/persons", async (req, res) => {
  const { name, number } = req.body;
  if (!name || !number || name.trim() === "" || number.trim() === "") {
    return res.status(400).json({
      error: "Missing information",
    });
  }

  const persons = await Person.find({});
  const duplicatePhone = persons.find((p) => p.number === number);

  if (duplicatePhone) {
    return res.status(400).json({
      error: "Number already exists",
    });
  }

  try {
    const person = new Person({ name, number });
    const savedPerson = await person.save();
    res.json(savedPerson);
  } catch (error) {
    return res.status(400).json({
      error: `Cannot saved person: ${error}`,
    });
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
