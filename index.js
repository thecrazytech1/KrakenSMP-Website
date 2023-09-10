require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();
const port = 3001; // Set your desired port
const MCWebPort = 8192; // Set your desired

// Replace with your Twitch application credentials
const twitchClientId = process.env.twitchClientId;
const twitchClientSecret = process.env.twitchClientSecret;
const twitchRedirectUri = process.env.twitchRedirectUri;

// Temporary storage for linked accounts (You should use a database in production)
const linkedAccounts = new Map();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.expressSecret, // Replace with a secure secret key
    resave: false,
    saveUninitialized: true,
  })
);

mongoose.connect(process.env.MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
const collection = db.collection("Twitch");

app.get("/auth/twitch", (req, res) => {
  const verificationCode = generateVerificationCode();

  linkedAccounts.set(verificationCode, null);

  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchClientId}&redirect_uri=${twitchRedirectUri}&response_type=code&scope=user_read&state=${verificationCode}`;
  res.redirect(twitchAuthUrl);
});

app.get("/auth/twitch/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!linkedAccounts.has(state)) {
    return res.status(400).send("Invalid verification code.");
  }

  await exchangeTwitchCodeForAccessToken(code, (accessToken) => {
    if (!accessToken) {
      return res.status(500).send("Failed to authenticate with Twitch.");
    }

    getUserInfoFromTwitch(accessToken, async (userInfo) => {
      if (!userInfo) {
        return res
          .status(500)
          .send("Failed to fetch user information from Twitch.");
      }

      linkedAccounts.set(state, userInfo);
      req.session.twitchData = await userInfo;

      const htmlForm = `
    <html>
      <body>
        <h1>Please Input your Minecraft Username</h1>
        <form method="post" id="form" action="http://localhost:3001/submit">
          <label for="name">Username:</label>
          <input type="text" id="username" name="username"><br>
          <input type="submit" value="Submit">
        </form>  
      </body>
    </html>
  `;

      res.status(200).send(htmlForm);
    });
  });
});

app.post("/submit", async (req, res) => {
  const name = req.body.username;
  const id = await getId(name);

  const twitchData = req.session.twitchData;

  if (!twitchData) {
    return res.status(400).send("No data available to submit.");
  }

  collection.findOneAndUpdate(
    {
      uuid: id,
    },
    {
      $set: {
        userId: twitchData.id,
      },
    },
    (err, updatedUser) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).send("Error updating user.");
      }

      if (!updatedUser) {
        return res.status(404).send("User not found.");
      }

      res
        .status(200)
        .send(
          "Successfully linked your account, you can now close this and go back ingame."
        );

      axios
        .post(`http://104.128.51.140:${MCWebPort}/`, twitchData)
        .catch((error) => {
          console.error("POST request failed");
          console.error(error);
        });
    }
  );
});

function generateVerificationCode() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function exchangeTwitchCodeForAccessToken(code, callback) {
  const res = axios
    .post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: twitchClientId,
        client_secret: twitchClientSecret,
        redirect_uri: twitchRedirectUri,
        code,
        grant_type: "authorization_code",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      const responseData = response.data;
      const accessToken = responseData.access_token;
      const refreshToken = responseData.refresh_token;

      return accessToken;
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  const accessToken = res;
  callback(await accessToken);
}

function getUserInfoFromTwitch(accessToken, callback) {
  const res = axios
    .get("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": twitchClientId,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      const userData = response.data.data[0];

      const userId = userData.id;
      const userName = userData.login;

      const userInfo = { id: userId, username: userName };
      return Promise.resolve(userInfo);
    });

  callback(res);
}

function formatUUID(uuid) {
  return uuid.replace(
    /^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/,
    "$1-$2-$3-$4-$5"
  );
}

function getId(playername) {
  return fetch(`https://api.mojang.com/users/profiles/minecraft/${playername}`)
    .then((data) => data.json())
    .then((player) => formatUUID(player.id));
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
