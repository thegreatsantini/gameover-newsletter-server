const express = require("express");
const gameSheets = express.Router();

gameSheets.get('/', (req, res, err)=> {
  res.send('hello from game sheets!')
})

gameSheets.get('/:id', (req, res, err) => {
  /*
    TODO:
      1) query users sheet to get watchlist data
      2) parse watchlist data
      3) query games sheet with game IDs to get game details and availability
  */
})

module.exports = gameSheets;