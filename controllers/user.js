require("dotenv").config();
const express = require("express");
const user = express.Router();
const client = require("smartsheet");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

// Get user's current watchlist
user.get("/:id", async (req, res, err) => {
  const userSearchOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.params.id}"`
    }
  };

  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    rowId: await smartsheet.search
      .searchSheet(userSearchOptions)
      .then(res => res.results[0].objectId)
  };
  const currentUserData = await smartsheet.sheets.getRow(options);
  const keys = [
    "id",
    "email",
    "userName",
    "password",
    "watchlist",
    "following"
  ];
  const massagedUser = currentUserData.cells.reduce((acc, next, i) => {
    if (i != 3) {
      acc[keys[i]] = next.value;
    }
    return acc;
  }, {});
  res.status(200).send({ "current user data!": massagedUser });
});

// Add game to watchlist
user.post("/watchlist/add", async (req, res, err) => {
  /*
  find current user
  post new watchlist array
  */
  var options = {
    id: process.env.SMARTSHEET_GAME_SHEET_ID
  };

  const allGames = await smartsheet.sheets.getSheet(options);
  allGames.rows.forEach(val => console.log(val.cells));
  res.status(200).send("Added new game to watchlist");
});

// Remove game from watchlist
user.post("/watchlist/remove", async (req, res, err) => {
  /*
  find current user
  post new watchlist array
  */
  var options = {
    id: process.env.SMARTSHEET_GAME_SHEET_ID
  };

  const allGames = await smartsheet.sheets.getSheet(options);
  res.status(200).send("Removed game from watchlist");
});
module.exports = user;
