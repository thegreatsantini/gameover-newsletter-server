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
user.put("/watchlist/add", async (req, res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.userId}"`
    }
  };

  const updatedWatchlist = [
    {
      id: await smartsheet.search
        .searchSheet(options)
        .then(data => data.results[0].objectId),
      cells: [
        {
          columnId: process.env.WATCHLIST_COLUMN_ID,
          value: req.body.gameRowId
        }
      ]
    }
  ];

  const addCellOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    body: updatedWatchlist
  };

  try {
    await smartsheet.sheets.updateRow(addCellOptions);
  } catch (err) {
    console.log("err", err);
  }
  res.status(200).send("Added new game to watchlist");
});

// Remove game from watchlist
user.post("/watchlist/remove", async (req, res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.userId}"`
    }
  };

  const updatedWatchlist = [
    {
      id: await smartsheet.search
        .searchSheet(options)
        .then(data => data.results[0].objectId),
      cells: [
        {
          columnId: process.env.WATCHLIST_COLUMN_ID,
          value: req.body.gameRowId
        }
      ]
    }
  ];

  const addCellOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    body: updatedWatchlist
  };

  try {
    await smartsheet.sheets.updateRow(addCellOptions);
  } catch (err) {
    console.log("err", err);
  }
  res.status(200).send("Removed game from watchlist");
});
module.exports = user;
