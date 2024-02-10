require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

const { database, misc, twitch, includeRoutes } = require("./utils");
const routes = require("./routes");

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(
  session({
    secret: process.env.expressSecret,
    resave: false,
    saveUninitialized: true,
  })
);

includeRoutes(app);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
