const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

app.use(bodyParser.urlencoded({ extended: false }));

app.get("/api/users", (req, res) => {
  const arr = Array.from(userMap, ([key, value]) => ({
    username: value.username,
    _id: `${key}`
  }));
  console.log(arr);
  res.json(arr);
});

app.post("/api/users", (req, res) => {
  const user = addUser(req.body.username);
  res.json(user);
});

app.post("/api/users/:id/exercises", (req, res) => {
  const oExercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date().toDateString()
  };
  const { username, _id } = addExercise(req.params.id, oExercise);
  res.json({ username, _id, ...oExercise });
});

app.get("/api/users/:id/logs", (req, res) => {
  const user = getUser(req.params.id);
  const queriedUser = applyQuery(user, req.query);
  res.json(queriedUser);
});

const userMap = new Map();

function getUser(id) {
  return userMap.get(parseInt(id));
}

function addUser(name) {
  const user = {
    username: name,
    count: 0,
    _id: Date.now(),
    log: []
  };
  userMap.set(user._id, user);
  return user;
}

function addExercise(id, oExercise) {
  const user = getUser(id);
  user.log.push(oExercise);
  user.count++;
  return user;
}

function applyQuery(user, query) {
  const { from, to, limit } = query;
  if (from || to || limit) {
    const oUser = { ...user };
    oUser.log = from
      ? user.log.filter(exercise => new Date(exercise.date) >= new Date(from))
      : user.log;
    oUser.log = to
      ? user.log.filter(exercise => new Date(exercise.date) <= new Date(to))
      : user.log;
    limit && oUser.log.splice(parseInt(limit));
    return oUser;
  } else {
    return user;
  }
}
