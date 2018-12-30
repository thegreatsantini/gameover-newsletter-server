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
  const options = {
    id: process.env.SMARTSHEET_GAME_SHEET_ID
  };

  const games = await smartsheet.sheets.getSheet(options);

  const keys = ["title", "console", "avaliable", "pending", "genres"];
  const gamesArr = games.rows.map((game, indexId) => {
    return game.cells.reduce((acc, next, i) => {
      if (!acc.hasOwnProperty("rowId")) {
        acc.rowId = games.rows[indexId].id;
      }
      acc[keys[i]] = next.displayValue;
      return acc;
    }, {});
  });
  res.status(200).send(gamesArr);
});

module.exports = gameSheets;
