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
  const keys = [
    'title',
    'console',
    'avaliable',
    'pending',
    'genres',
  ]
  const gamesArr =  games.rows.map( game => game.cells.reduce((acc, next, i) => {
    acc[keys[i]] = next.displayValue
    return acc
  }, {}) )
  console.log(gamesArr)
  res.status(200).send({"all games!": gamesArr});
});

module.exports = gameSheets;
