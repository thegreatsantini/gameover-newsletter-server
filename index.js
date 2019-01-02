const express = require("express");
const app = express(),
  bodyParser = require("body-parser"),
  cors = require("cors"),
  fs = require("fs"),
  qs = require("querystring"),
  ssclient = require("smartsheet");

const auth = require("./controllers/auth");
const gameSheets = require("./controllers/gameSheets");
const usersSheet = require("./controllers/usersSheet");
const user = require("./controllers/user");

// middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// controllers
app.use("/auth", auth);
app.use("/user", user);
app.use("/gamesheets", gameSheets);
app.use("/usersSheet", usersSheet);

// setting up home route containing basic page content
app.get("/test", (req, res) => {
  res.send(
    '<h1>Hello From server</h1>'
  );
});

const PORT = process.env.PORT || 8080
// starting an express server
app.listen(PORT, () => {
  console.log("Ports listening on 3000...");
});
