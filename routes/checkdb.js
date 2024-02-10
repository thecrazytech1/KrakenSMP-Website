const express = require("express");
const router = express.Router();
const database = require("../utils/database");

router.get("/checkdb", async (req, res) => {
  database.ping((err) => {
    if (err) {
      return res.status(500).json({ status: "Not connected" });
    }

    res.json({ status: "Connected" });
  });
});

module.exports = router;
