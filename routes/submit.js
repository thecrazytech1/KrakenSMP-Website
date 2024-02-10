const express = require("express");
const utils = require("../utils");
const axios = require("axios");
const router = express.Router();
const { misc, database } = utils;
const connection = database;
const getId = misc.getId;
const MCWebPort = 8192;

router.post("/submit", async (req, res) => {
  const playerName = req.body.username;
  const uuid = await getId(playerName);
  const twitchData = req.session.twitchData;

  if (!twitchData) {
    return res.status(400).send("No data available to submit.");
  }

  connection.query(
    `SELECT userId FROM users
        WHERE uuid = '${uuid}'
        LIMIT 1;`,
    function (err, result, fields) {
      if (result.length === 0) {
        connection.query(
          `INSERT INTO users (uuid, playerName, userId)
              VALUES ('${uuid}', '${playerName}', '${twitchData.id}');`,
          function (err, result, fields) {
            if (err) {
              console.error("Error creating new user:", err);
              return res.status(500).send("Error creating new user.");
            }

            // http://104.128.51.140:${MCWebPort}/
            axios
              .post(`http://localhost:${MCWebPort}/`, twitchData)
              .catch((error) => {
                console.error("POST request failed");
                console.error(error);
              });

            return res.json({ status: "Success" });
          }
        );
      } else if (result[0].userId === "Null") {
        connection.query(
          `UPDATE users 
              SET userId = '${twitchData.id}' 
              WHERE uuid = '${uuid}' 
              LIMIT 1;`,
          function (err, result, fields) {
            if (err) {
              console.error("Error updating user:", err);
              return res.status(500).send("Error updating user.");
            }

            // http://104.128.51.140:${MCWebPort}/
            axios
              .post(`http://localhost:${MCWebPort}/`, twitchData)
              .catch((error) => {
                console.error("POST request failed");
                console.error(error);
              });

            return res.json({ status: "Success" });
          }
        );
      } else {
        return res.json({ status: "AlreadyLinked" });
      }
    }
  );
});

module.exports = router;
