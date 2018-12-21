require('dotenv').config();
const auth = express.Router();
const client = require('smartsheet');
const express = require("express");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: 'info'
});
const userSheetId = process.env.SMARTSHEET_USER_SHEET_ID;

auth.get('/', (req, res, err) => {
  res.send('hello from auth!')
})

auth.post('/server', (req, res, err) => {
  smartsheet.sheets.getSheet({id: userSheetId})
    .then(sheetInfo => {
      console.log(sheetInfo);
      res.status(200).send({ 'req.body': req.body });
    })
    .catch(error => {
      console.log(error);
    });
})

module.exports = auth;