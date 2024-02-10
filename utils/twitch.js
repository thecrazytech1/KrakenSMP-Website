const axios = require("axios");

async function exchangeTwitchCodeForAccessToken(code, callback) {
  const res = axios
    .post("https://id.twitch.tv/oauth2/token", null, {
      params: {
        client_id: process.env.twitchClientId,
        client_secret: process.env.twitchClientSecret,
        redirect_uri: process.env.twitchRedirectUri,
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
        "Client-ID": process.env.twitchClientId,
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

function hasSubscription(broadcaster_id, user_id) {
  const accessToken = "5lvhg3jqdtfnp58xjlu1dzyoy1ze76";
  let url = `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcaster_id}&user_id=${user_id}`;

  if (user_id == "") return url.replace("&user_id=${user_id}", "");

  axios
    .get(url, {
      headers: {
        Authorization: "Bearer " + accessToken,
        "Client-Id": "pdb35c7mc7mxmsxd5p564knzm3hasx",
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  exchangeTwitchCodeForAccessToken,
  getUserInfoFromTwitch,
  hasSubscription,
};
