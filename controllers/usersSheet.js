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
  console.log(massagedData);
  res.status(200).send({ "All Users!": massagedData });
});
// View user
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
  const friendData = await smartsheet.sheets.getRow(friendOptions);

  res.status(200).send({ "Friend Data": friendData });
});
// Follow user
usersSheet.put("/followers/add", async (req, res, err) => {
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
  }

  res.status(200).send("Added new user");
});
// Remove a followed user
usersSheet.post("/followers/remove", async (req, res, err) => {
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
  }

  res.status(200).send("removed user");
});
module.exports = usersSheet;
