const express = require("express");
const morgan = require('morgan');
const app = express();

app.use(express.json());
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',JSON.stringify(req.body)
  ].join(' ')
}));
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.send(persons);
});

app.get("/api/info", (req, res) => {
  res.send(`
    <div>
        <p>Phone book has info for ${persons.length} people</p>
        <p>${new Date.toLocaleString()}</p>
    </div>`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => person.id === id);

  if (person) {
    res.json(person);
  } else {
    return res.status(404).json({
      error: `Person with this id: ${id} not found`,
    });
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  persons = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

const generateUniqueId = () => {
  let newId;
  let isUnique = false;

  while (!isUnique) {
    newId = Math.floor(Math.random() * 1000000).toString();
    isUnique = !persons.some((entry) => entry.id === newId);
  }

  return newId;
};

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;
  if (!name || !number || name.trim() === "" || number.trim() === "") {
    return res.status(400).json({
      error: "Missing information",
    });
  }

  const foundName =
    persons.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
    persons.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
  const foundNubmer = persons.find((p) => p.number === number);
  if (foundName || foundNubmer) {
    return res.status(400).json({
      error: "Name or number already exists",
    });
  }

  const newPerson = {
    name,
    number,
    id: generateUniqueId(),
  };
  persons = persons.concat(newPerson);
  res.json(newPerson);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running on PORT: ", PORT);
});
