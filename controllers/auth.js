require("dotenv").config();
const express = require("express");
const auth = express.Router();
const client = require("smartsheet");
const uuidv1 = require("uuid/v1");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});
const userSheetId = process.env.SMARTSHEET_USER_SHEET_ID;

auth.get("/", (req, res, err) => {
  res.send("hello from auth!");
});

auth.post('/server/login', (req,res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.email}"`
    } 
  };

  smartsheet.search
    .searchSheet(options)
    .then( function(results) {
      if (results.totalCount > 0) {
        console.log()
        res.status(200).send({'data' : results.results[0].contextData[0].split(' ')[2]})
      }
      else {
        res.status(400).send('no user')
      }
    })
    .catch(function(error) {
      console.log(error);
    });
})

auth.post("/server/signup", (req, res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.email}"`
    }
  };

  smartsheet.search
    .searchSheet(options)
    .then( function(results) {
      if (results.totalCount === 0) {
        // add row in smart sheet
        const row = [
          {
            cells: [
              {
                columnId: process.env.USERID_COLUMN_ID,
                value: uuidv1()
              },
              {
                columnId: process.env.EMAIL_COLUMN_ID,
                value: req.body.email
                // "strict": false
              },
              {
                columnId: process.env.PASSWORD_COLUMN_ID,
                value: req.body.userName
              },
              {
                columnId: process.env.USERNAME_COLUMN_ID,
                value: req.body.password
              }
            ]
          }
        ];
        // Set options
        var options = {
          sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
          body: row
        };

        // Add rows to sheet
        smartsheet.sheets
          .addRows(options)
          .then(function(newRows) {
            console.log(newRows.result[0].cells)
            res.status(200).send(newRows.result[0].cells[0].value);
          })
          .catch(function(error) {
            res.status(400).send("Unable to add new user");
          });
      } else {
        res.status(200).send(results);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
  // smartsheet.sheets.getSheet({id: userSheetId})
  //   .then(sheetInfo => {
  //     // console.log(sheetInfo);
  //     res.status(200).send({ 'req.body': req.body });
  //   })
  //   .catch(error => {
  //     console.log(error);
  //   });
});

module.exports = auth;
