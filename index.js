const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
require("dotenv").config();

const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));


const errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err.name === "CastError") {
    return res.status(400).send({ error: "malformed id" });
  }

  next(err);
};

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



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.get("/api/persons", (req, res, next) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/info", (req, res,next) => {
  Person.find({}).then(persons =>{
    res.send(`
      <div>
          <p>Phone book has info for ${persons.length} people</p>
          <p>${new Date().toLocaleString()}</p>
      </div>`);
  }).catch(err=> next(err));
  
});

app.get("/api/persons/:id", (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  Person.findById(req.params.id).then((person) => {
    res.json(person);
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

app.post("/api/persons", async (req, res, next) => {
  const { name, number } = req.body;
  if (!name || !number || name.trim() === "" || number.trim() === "") {
    return res.status(400).json({
      error: "Missing information",
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

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((err) => next(err));
});


app.use(unknownEndpoint);
app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
