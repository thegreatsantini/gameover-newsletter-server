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

  const gameKeys = ["title", "console", "available", "received", "genres"];
  const userKeys = [
    "rowId",
    "id",
    "email",
    "userName",
    "watchlist",
    "following"
  ];

  const allGames = await smartsheet.sheets
    .getSheet({ id: process.env.SMARTSHEET_GAME_SHEET_ID })
    .then(res => {
      return res.rows.reduce((parentObj, parentNext, index) => {
        parentObj[parentNext.id] = parentNext.cells.reduce((acc, next, i) => {
          acc[gameKeys[i]] = next.value || "";
          return acc;
        }, {});
        return parentObj;
      }, {});
    })
    .catch(err => console.log(err));
  const allUsers = await smartsheet.sheets
    .getSheet({ id: process.env.SMARTSHEET_USER_SHEET_ID })
    .then(res => {
      return res.rows.reduce((parentObj, parentNext, index) => {
        parentObj[parentNext.id] = parentNext.cells.reduce((acc, next, i) => {
          if (!acc.hasOwnProperty("rowId")) {
            acc[userKeys[i]] = parentNext.id;
          } else {
            acc[userKeys[i]] = next.value || "";
          }
          return acc;
        }, {});
        return parentObj;
      }, {});
    })
    .catch(err => console.log(err));
  try {
    const currentUserData = await smartsheet.sheets.getRow(options);
    const mySpit = data => (data.length > 1 ? data.split(",") : [data]);
    const { cells } = currentUserData;
    const userObj = {
      userId : cells[0].value,
      email: cells[1].value,
      userName: cells[2].value,
      watchlist: mySpit(currentUserData.cells[4].displayValue.trim()).map(
        val => allGames[val]
      ),
      followers: mySpit(currentUserData.cells[5].displayValue.trim()).map(
        val => allUsers[val]
      )
    };    
    res.status(200).send(userObj);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err.toString() });
  }
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
    res.status(500).json({ error: err.toString() });
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
    res.status(500).json({ error: err.toString() });
  }
  res.status(200).send("Removed game from watchlist");
});
module.exports = user;
