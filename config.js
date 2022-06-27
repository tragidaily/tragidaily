// eslint-disable-next-line node/no-process-env
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

      jornal: {
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
      administrador: {
        id: "864720804691050496",
      },

      moderador: {
        id: "959787387184107580",
      },

      jornalistaInvestigativo: {
        id: "968688946043310150",
      },
    },
  },

  replit: {
    databaseUrl: REPLIT_DB_URL,
  },
};

export default config;
