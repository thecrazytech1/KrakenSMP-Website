require('dotenv').config()
const express = require("express");
const path = require("path");
const axios = require('axios')

const router = express.Router();

router.get("/skin/:uuid?", async (req, res) => {
  const { uuid } = req.params;

  if (!uuid) {
    res
      .status(400)
      .send("Please input a UUID in the URL, like /skin/your-uuid");
    return;
  }

  try {
    const skinData = await minecraft.getSkin(uuid);
    res.setHeader("Content-Type", "image/png"); // Adjust content type based on actual response type
    skinData.pipe(res);
  } catch (error) {
    // Handle errors
    console.error("Error in /skin:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/success", async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/success.html"));
});

router.get("/AlreadyLinked", async (req, res) => {
  res.sendFile(path.join(__dirname, "../public/AlreadyLinked.html"));
});

router.get("/getSubscriptions/:broadcasterId/:userId", async (req, res) => {
  const { broadcasterId, userId } = req.params
  axios.get(`${process.env.TWITCH_API_BASE_URL}/subscriptions?broadcaster_id=${broadcasterId}&user_id=${userId}`, {
    headers: {
      'Client-ID': process.env.twitchClientId,
      'Authorization': `Bearer ${process.env.twitchAccessToken}`
    }
  }).then((res) => {
    console.log(res.data)
  })
});

module.exports = router;
