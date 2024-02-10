const express = require("express");
const router = express.Router();
const axios = require("axios");
const linkedAccounts = new Map();
const utils = require("../utils");
const {
  exchangeTwitchCodeForAccessToken,
  getUserInfoFromTwitch,
} = require("../utils/twitch");
const { generateVerificationCode } = require("../utils/misc");
const {
  GetAccessToken,
  LogintoXboxLive,
  GetXSTStoken,
  GetMCBearerToken,
  ViewProfileInfomation,
} = require("../utils/OAuth");
const { database } = utils;
const { checkAndInsertUser } = database;
const path = require("path");

router.get("/auth/twitch/callback", async (req, res) => {
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

      res.redirect("/microsoft");
    });
  });
});

router.get("/twitch", (req, res) => {
  const verificationCode = generateVerificationCode();

  linkedAccounts.set(verificationCode, null);

  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.twitchClientId}&redirect_uri=${process.env.twitchRedirectUri}&response_type=code&scope=user_read&state=${verificationCode}`;
  res.redirect(twitchAuthUrl);
});
router.get("/microsoft", (req, res) => {
  res.redirect(
    "https://login.live.com/oauth20_authorize.srf?client_id=fd957224-3dc3-4ca8-a3e4-7a32d7377348&response_type=code&redirect_uri=http://localhost:3001/auth/microsoft&scope=XboxLive.signin%20offline_access"
  );
});

router.get("/auth/microsoft", async (req, res) => {
  try {
    const { code } = req.query;

    const { access_token } = await GetAccessToken(code);
    const { Token } = await LogintoXboxLive(access_token);
    const { XToken, UHS } = await GetXSTStoken(Token);
    const { MCAccessToken } = await GetMCBearerToken(XToken, UHS);

    const { MCUUID, MCUSERNAME } = await ViewProfileInfomation(MCAccessToken);
    req.session.mcData = { uuid: MCUUID, username: MCUSERNAME };

    try {
      await checkAndInsertUser(
        MCUUID,
        MCUSERNAME,
        req.session.twitchData.id,
        res
      );
    } catch (err) {
      console.log(`There was an error: ${err}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
