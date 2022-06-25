/* eslint-disable node/no-process-env */
import server from "./server.json";

const { TOKEN, GUILD_ID, CLIENT_ID, REPLIT_DB_URL } = process.env;

const config = {
  discord: {
    token: TOKEN,
    guildId: GUILD_ID,
    clientId: CLIENT_ID,

    ...server,
  },

  replit: {
    databaseUrl: REPLIT_DB_URL,
  },
};

export default config;
