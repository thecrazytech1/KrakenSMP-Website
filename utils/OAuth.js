const axios = require("axios");

async function GetAccessToken(MCCode) {
  try {
    const url = "https://login.live.com/oauth20_token.srf";
    const body = {
      client_id: "fd957224-3dc3-4ca8-a3e4-7a32d7377348",
      client_secret: "nG88Q~zussGCE1fh2CONJtRwUy_Oru_1EeseQbGN",
      code: MCCode,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3001/auth/microsoft",
    };

    const response = await axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: body,
    });

    return { access_token: response.data };
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

async function LogintoXboxLive(AccessToken) {
  try {
    const accessToken = await AccessToken;

    const url = "https://user.auth.xboxlive.com/user/authenticate";
    const body = {
      Properties: {
        AuthMethod: "RPS",
        SiteName: "user.auth.xboxlive.com",
        RpsTicket: `d=${accessToken.access_token}`,
      },
      RelyingParty: "http://auth.xboxlive.com",
      TokenType: "JWT",
    };

    const response = await axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: body,
    });

    return {
      Token: response.data.Token,
    };
  } catch (error) {
    console.error("Error logging into Xbox Live:", error);
    throw error;
  }
}

async function GetXSTStoken(Token) {
  try {
    const url = "https://xsts.auth.xboxlive.com/xsts/authorize";
    const body = {
      Properties: {
        SandboxId: "RETAIL",
        UserTokens: [`${Token}`],
      },
      RelyingParty: "rp://api.minecraftservices.com/",
      TokenType: "JWT",
    };

    const response = await axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: body,
    });

    return {
      XToken: response.data.Token,
      UHS: response.data.DisplayClaims.xui[0].uhs,
    };
  } catch (error) {
    console.error("Error Getting XTST Token:", error);
    throw error;
  }
}

async function GetMCBearerToken(Token, UHS) {
  try {
    const url =
      "https://api.minecraftservices.com/authentication/login_with_xbox";
    const body = {
      identityToken: `XBL3.0 x=${UHS};${Token}`,
      ensureLegacyEnabled: true,
    };

    const response = await axios({
      method: "post",
      url,
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
    });

    return { MCAccessToken: response.data.access_token };
  } catch (error) {
    console.error("Error getting mc bearer token:", error);
    throw error;
  }
}

async function ViewProfileInfomation(MCAccessToken) {
  try {
    const url = "https://api.minecraftservices.com/minecraft/profile";

    const response = await axios({
      method: "get",
      url,
      headers: {
        Authorization: `Bearer ${MCAccessToken}`,
      },
    });

    const formattedUUID = response.data.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    return { MCUUID: formattedUUID, MCUSERNAME: response.data.name };
  } catch (error) {
    console.error("Error getting profile information:", error);
    throw error;
  }
}

module.exports = {
  GetAccessToken,
  LogintoXboxLive,
  GetXSTStoken,
  GetMCBearerToken,
  ViewProfileInfomation,
};
