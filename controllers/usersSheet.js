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
  console.log("All Users", allUsers);
  res.status(200).send("Grabbing all Users!");
});
// View user
usersSheet.get("/view/:id", async (req, res, err) => {
  var options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.params.id}"`
    }
  };

  const friendOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    rowId: await smartsheet.search
      .searchSheet(options)
      .then(res => res.results[0].objectId)
  };
  const friendData = await smartsheet.sheets.getRow(friendOptions);
  console.log('Friend Data'. friendData);
  res.status(200).send("viewing friend profile");
});
// Follow user
usersSheet.post("/followers/add", async (req, res, err) => {
  /*
  find current user
  get followers
  add new follower
  */
 // Set options
var options = {
  id: process.env.SMARTSHEET_USER_SHEET_ID // Id of Sheet
};

// Saved some data manip for you
const userToAdd = allUserssmartsheet.sheets.getSheet(options)
    .then(function(sheetInfo) {
        console.log(sheetInfo);
    })
    .catch(function(error) {
        console.log(error);
    });

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
