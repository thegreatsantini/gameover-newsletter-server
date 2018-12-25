require("dotenv").config();
const express = require("express");
const user = express.Router();
const client = require("smartsheet");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

user.get("/:id", async (req, res, err) => {
  const userSearchOptions = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.params.id}"`
    }
  };

  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    rowId: await smartsheet.search.searchSheet(userSearchOptions).then(res => res.results[0].objectId)
  };

  const currentUserData = await smartsheet.sheets.getRow(options);

  res.status(200).send("Fetching current user data!");
});

module.exports = user;
