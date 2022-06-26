/* eslint-disable node/no-process-env */
const { TOKEN, GUILD_ID, CLIENT_ID, REPLIT_DB_URL } = process.env;

const config = {
  discord: {
    token: TOKEN,
    guildId: GUILD_ID,
    clientId: CLIENT_ID,

    channels: {
      diario: {
        id: "968689805762367558",
      },
      journal: {
        id: "921501414847545394",
      },
      militadas: {
        id: "961176960086720532",
      },
      artes: {
        id: "864730261588803605",
      },
      reportes: {
        id: "959996003816185908",
      },
      submundoChat: {
        id: "961172391529160734",
      },
      submundoHumorNegro: {
        id: "961176833343246348",
      },
    },
    roles: {
      adm: {
        id: "864720804691050496",
      },
      mod: {
        id: "959787387184107580",
      },
    },
  },

  replit: {
    databaseUrl: REPLIT_DB_URL,
  },
};

export default config;
