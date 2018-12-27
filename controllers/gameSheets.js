require("dotenv").config();
const express = require("express");
const gameSheets = express.Router();
const client = require("smartsheet");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

// List all games
gameSheets.get("/games", async (req, res, err) => {
  var options = {
    id: process.env.SMARTSHEET_GAME_SHEET_ID
  };

  const games = await smartsheet.sheets.getSheet(options);
  console.log('game', games)
  res.status(200).send("Fetching all games!");
});

module.exports = gameSheets;
