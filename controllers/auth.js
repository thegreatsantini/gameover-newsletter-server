require("dotenv").config();
const express = require("express");
const auth = express.Router();
const client = require("smartsheet");
const uuidv1 = require("uuid/v1");
const bcrypt = require("bcryptjs");

const smartsheet = client.createClient({
  accessToken: process.env.SMARTSHEET_TOKEN,
  logLevel: "info"
});

auth.post("/server/login", (req, res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.email}"`
    }
  };

  smartsheet.search
    .searchSheet(options)
    .then(function(results) {
      if (results.totalCount > 0) {
        const userInfo = {
          sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
          rowId: results.results[0].objectId
        };
        // get user password to check match
        smartsheet.sheets
          .getRow(userInfo)
          .then(async row => {
            const userPass = row.cells[3].displayValue;
            const checkPass = await bcrypt.compareSync(
              req.body.password,
              row.cells[3].displayValue
            );
            const person = {
              userId: row.cells[0].value,
              userName: row.cells[2].value,
              watchList: row.cells[4].value
            };
            if (checkPass) {
              res.status(200).send(person);
            } else if (!checkPass) {
              res.status(200).send({ message: "incorrect email or password" });
            } else {
              res.status(400).send({ meassage: "something else went wrong" });
            }
          })
          .catch(err => console.log("line 34", err));
      } else {
        res.status(200).send({ message: "User not recognized" });
      }
    })
    .catch(function(error) {
      console.log("error in search", error);
    });
});

auth.post("/server/signup", (req, res, err) => {
  const options = {
    sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
    queryParameters: {
      query: `"${req.body.email}"`
    }
  };

  smartsheet.search
    .searchSheet(options)
    .then(async results => {
      if (results.totalCount === 0) {
        const salt = await bcrypt.genSaltSync(10);
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
              },
              {
                columnId: process.env.PASSWORD_COLUMN_ID,
                value: await bcrypt.hashSync(req.body.password, salt)
              },
              {
                columnId: process.env.USERNAME_COLUMN_ID,
                value: req.body.userName
              },
              {
                columnId: process.env.WATCHLIST_COLUMN_ID,
                value: ""
              }
            ]
          }
        ];
        // Set options
        const options = {
          sheetId: process.env.SMARTSHEET_USER_SHEET_ID,
          body: row
        };

        // Add rows to sheet
        smartsheet.sheets
          .addRows(options)
          .then(function(newRows) {
            const person = {
              userId: newRows.result[0].cells[0].value,
              userName: newRows.result[0].cells[2].value,
              watchList: ""
            };
            res.status(200).send(person);
          })
          .catch(function(error) {
            res.status(400).send("Unable to add new user");
          });
      } else {
        res.status(200).send({ message: "User already exists" });
        // res.status(200).send(results);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
});

module.exports = auth;
