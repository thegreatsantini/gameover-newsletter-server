const express = require("express");
const gameSheets = express.Router();


gameSheets.get('/', (req, res, err)=> {
    res.send('hello from game sheets!')
})

module.exports = gameSheets;