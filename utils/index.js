const database = require("./database");
const twitch = require("./twitch");
const misc = require("./misc");
const oauth = require('./OAuth')

const fs = require("fs");
const path = require("path");

const includeRoutes = (app) => {
  const routesDir = path.join(__dirname, "../routes");

  fs.readdirSync(routesDir).forEach((file) => {
    if (file.endsWith(".js") && file !== "index.js") {
      const routePath = `../routes/${file}`;
      const route = require(routePath);
      app.use("/", route);
    }
  });
};

module.exports = {
  database,
  twitch,
  misc,
  oauth,
  includeRoutes,
};
