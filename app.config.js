const appJson = require('./app.json');

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    oauth: {
      issuer: process.env.EXPO_OAUTH_URI,
      clientId: process.env.EXPO_OAUTH_CLIENT_ID,
      redirectUri: process.env.EXPO_OAUTH_REDIRECT_URI,
    },
  },
};
