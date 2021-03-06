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
    "id",
    "email",
    "userName",
    "password",
    "watchlist",
    "following"
  ];

  const allGames = await smartsheet.sheets
    .getSheet({ id: process.env.SMARTSHEET_GAME_SHEET_ID })
    .then(res => {
      return res.rows.reduce((parentObj, parentNext, index) => {
        parentObj[parentNext.id] = parentNext.cells.reduce((acc, next, i) => {
          if (!acc.hasOwnProperty("rowId")) {
            acc["rowId"] = parentNext.id;
          }
          acc[gameKeys[i]] = next.displayValue || "";
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
            acc.rowId = parentNext.id;
          }
          if (userKeys[i] !== "password") {
            acc[userKeys[i]] = next.displayValue || "";
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
      userId: cells[0].value,
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

  const updatedGamesRow = await smartsheet.search
    .searchSheet(options)
    .then(async data => {
      return await smartsheet.sheets
        .getRow({
          sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
          rowId: data.results[0].objectId
        })
        .then(res => {
          let currentGames = res.cells[4].displayValue;
          return currentGames + "," + req.body.gameRowId;
        })
        .catch(err => console.log(err));
    });
  const updatedWatchlist = [
    {
      id: await smartsheet.search
        .searchSheet(options)
        .then(data => data.results[0].objectId),
      cells: [
        {
          columnId: process.env.WATCHLIST_COLUMN_ID,
          value: updatedGamesRow
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
user.put("/watchlist/remove", async (req, res, err) => {
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
          value: req.body.gameRows
        }
      ]
    }
  ];
  const addCellOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    body: updatedWatchlist
  };

  try {
    const remove = await smartsheet.sheets.updateRow(addCellOptions);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err.toString() });
  }
  res.status(200).send("Removed game from watchlist");
});
module.exports = user;
