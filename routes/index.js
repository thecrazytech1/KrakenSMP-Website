const express = require("express");
const authRoutes = require("./auth");
const submitRoutes = require("./submit");
const twitchRoutes = require("./twitch");
const miscRouter = require("./misc");
const dbRouter = require("./checkdb");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/submit", submitRoutes);
router.use("/twitch", twitchRoutes);
router.use("/misc", miscRouter);
router.use("/checkdb", dbRouter);

module.exports = router;
