require("dotenv").config();
const express = require("express");
const usersSheet = express.Router();
const client = require("smartsheet");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

// List Users
usersSheet.get("/all", async (req, res, err) => {
  const options = {
    id: process.env.SMARTSHEET_USER_SHEET_ID
  };

  const allUsers = await smartsheet.sheets.getSheet(options);
  res.status(200).send("Grabbing all Users!");
});
// Follow user
usersSheet.post("/followers/add", async (req, res, err) => {
  /*
  find current user
  get followers
  add new follower
  */
  res.status(200).send("Added new user");
});
// Remove a followed user
usersSheet.post("/followers/remove", async (req, res, err) => {
  /*
  find current user
  get followers
  add new follower
  */
  res.status(200).send("removed user");
});
module.exports = usersSheet;
