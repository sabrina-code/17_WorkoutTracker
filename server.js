const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const mongojs = require("mongojs");
const User = require("./models/userModel.js");
const app = express();
const axios = require("axios");

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workoutDb", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.Promise = global.Promise; //Es6 Promise. take away depreciated Promise issue

app.use(logger("dev"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json()); // Make sure it comes back as json
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname + "./public/index.html"));
});

app.post("/submit", ({ body }, res) => {
  const user = new User(body);
  user.lastUpdatedDate();

  User.create(user)
    .then((dbUser) => {
      res.json(dbUser); //*********This is !
    })
    .catch((err) => {
      res.json(err);
    });
});

app.get("/all", (req, res) => {
  User.find({}, (err, data) => {
    res.json(data);
  });
});

app.get("/find/:id", (req, res) => {
  User.findOne(
    {
      _id: mongojs.ObjectId(req.params.id),
    },
    (err, data) => {
      res.json(data);
    }
  );
});

app.post("/update/:id", (req, res) => {
  User.update(
    {
      _id: mongojs.ObjectId(req.params.id),
    },
    {
      $set: {
        trail: req.body.trail,
        note: req.body.note,
        modified: Date.now(),
      },
    },
    (err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  User.remove(
    {
      _id: mongojs.ObjectID(req.params.id),
    },
    (error, data) => {
      if (error) {
        res.send(error);
      } else {
        res.send(data);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
