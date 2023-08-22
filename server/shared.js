const fs = require("fs");

exports.clientUrl = "http://localhost:3000";
exports.serverUrl = "http://localhost:5000";
exports.serverPort = 5000;
exports.adminId = 45463348;

exports.getAccessTokenByUserId = function (userId) {
  try {
    const accessTokenData = fs.readFileSync("accessTokens.json");
    const accessTokenMap = JSON.parse(accessTokenData);
    const accessToken = accessTokenMap[userId];
    return accessToken;
  } catch (error) {
    console.error("Error reading AccessToken file:", error);
    return null;
  }
};
