const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: "s18971_Twitch_Sub_Link",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

const checkAndInsertUser = async (uuid, playerName, twitchData, res) => {
  try {
    connection.query('SELECT * FROM users', async function (err, rows, fields) {
      if (err) throw err;

      if (rows.length === 0) {
        await connection.query(
          `INSERT INTO users (uuid, playerName, userId) VALUES (?, ?, ?)`,
          [uuid, playerName, twitchData]
        );
        return res.redirect('/success');
      } else if (
        rows[0].uuid === null &&
        rows[0].playerName === null &&
        rows[0].userId === null
      ) {
        await connection.query(
          `INSERT INTO users (uuid, playerName, userId) VALUES (?, ?, ?)`,
          [uuid, playerName, twitchData]
        );
        return res.redirect('/success');
      } else {
        return res.redirect('/AlreadyLinked');
      }
    });
  } catch (error) {
    console.error("Error processing user:", error);
    return res.status(500).send("Error processing user.");
  }
};


module.exports = {
  connection, checkAndInsertUser
};
