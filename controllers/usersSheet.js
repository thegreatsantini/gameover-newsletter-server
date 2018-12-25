require("dotenv").config();
const express = require("express");
const usersSheet = express.Router();
const client = require("smartsheet");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

usersSheet.get("/all", async (req, res, err) => {
  const options = {
    id: process.env.SMARTSHEET_USER_SHEET_ID,
  };

   const allUsers = await smartsheet.sheets.getSheet(options)
  res.status(200).send("Grabbing all Users!");
  
});

module.exports = usersSheet;
