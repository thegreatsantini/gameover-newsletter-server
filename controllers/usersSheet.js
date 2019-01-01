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

  const keys = [
    "id",
    "email",
    "username",
    "password",
    "watchlist",
    "following"
  ];

  const massagedData = allUsers.rows.map((person, index) => {
    return person.cells.reduce((acc, next, i) => {
      if (!acc.hasOwnProperty("rowId")) {
        acc.rowId = allUsers.rows[index].id;
      }
      acc[keys[i]] = next.value || "";
      return acc;
    }, {});
  });
  res.status(200).send(massagedData);
});
// Get Friend Data
usersSheet.get("/view/:id", async (req, res, err) => {
  const options = {
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
    const friendData = await smartsheet.sheets.getRow(friendOptions);
    const mySpit = data => (data.length > 1 ? data.split(",") : [data]);
    const { cells } = friendData;
    const friendObject = {
      userRow: friendData.id,
      email: cells[1].value,
      userName: cells[2].value,
      watchlist: mySpit(friendData.cells[4].displayValue.trim()).map(
        val => allGames[val]
      ),
      followers: mySpit(friendData.cells[5].displayValue.trim()).map(
        val => allUsers[val]
      )
    };
  
    res.status(200).send(friendObject);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err.toString() });
  }
});
// Follow user
usersSheet.put("/followers/add", async (req, res, err) => {
  const searchOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.userId}"`
    }
  };

  const newFriendsRow = await smartsheet.search
    .searchSheet(searchOptions)
    .then(async data => {
      return await smartsheet.sheets
        .getRow({
          sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
          rowId: data.results[0].objectId
        })
        .then(res => {
          let currentFollowers = res.cells[5].displayValue;
          return currentFollowers + "," + req.body.friendRowId;
        });
    });

  const newCell = [
    {
      id: await smartsheet.search
        .searchSheet(searchOptions)
        .then(data => data.results[0].objectId),
      cells: [
        {
          columnId: process.env.FOLLOWING_COLUMN_ID,
          value: newFriendsRow
        }
      ]
    }
  ];

  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    body: newCell
  };
  try {
    await smartsheet.sheets.updateRow(options);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err.toString() });
  }

  res.status(200).send("Added new user");
});
// Remove a followed user
usersSheet.post("/followers/remove", async (req, res, err) => {
  console.log('RRRRRRRRRRRRRRRRRRRRRRRRRRRRRUUUUUUUUUUUNNNNN')
  const searchOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.userId}"`
    }
  };

  const newCell = [
    {
      id: await smartsheet.search
        .searchSheet(searchOptions)
        .then(data => data.results[0].objectId),
      cells: [
        {
          columnId: process.env.FOLLOWING_COLUMN_ID,
          value: req.body.friendRowId
        }
      ]
    }
  ];

  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    body: newCell
  };
  try {
    await smartsheet.sheets.updateRow(options);
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err.toString() });
  }

  res.status(200).send("removed user");
});
module.exports = usersSheet;
