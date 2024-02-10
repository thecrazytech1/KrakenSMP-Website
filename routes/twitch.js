const express = require("express");
const router = express.Router();
const { hasSubscription } = require("../utils/twitch");

router.get("/subscription", async (req, res) => {
  const broadcaster_id = req.query.broadcaster_id;
  const user_id = req.query.user_id;

  hasSubscription(broadcaster_id, user_id);
});

module.exports = router;
