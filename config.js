// eslint-disable-next-line node/no-process-env
const { REPLIT_DB_URL, TOKEN, GUILD_ID, CLIENT_ID } = process.env;

const config = {
  replit: {
    databaseUrl: REPLIT_DB_URL,
  },

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

    colors = {
      vermelho: "#b80000",
      laranja: "#ff8000",
      amarelo: "#fff200",
      verde: "#48ff00",
      azul: "#005eff",
      roxo: "#a600ed",
      rosa: "#ff00f7",
      branco: "#ffffff",
      preto: "#000000",
    },

    badwords: [
      "arrombado",
      "baitola",
      "bicha",
      "boceta",
      "boiola",
      "boquete",
      "boqueteiro",
      "buceta",
      "bucetão",
      "bucetinha",
      "cabaço",
      "cacete",
      "caralho",
      "caralhudo",
      "cocozento",
      "corna",
      "corno",
      "cu",
      "cuzão",
      "cuzinho",
      "cuzuda",
      "demente",
      "esperma",
      "fdp",
      "fimosento",
      "fode",
      "fodendo",
      "foder",
      "fodida",
      "fodido",
      "fude",
      "fudida",
      "fudido",
      "gozada",
      "gozar",
      "gozei",
      "masturba",
      "masturbação",
      "masturbar",
      "masturbe",
      "masturbe-se",
      "merda",
      "pênis",
      "pintão",
      "pinto",
      "piroca",
      "porrinha",
      "punheta",
      "punhetão",
      "puta",
      "puto",
      "roluda",
      "roludo",
      "sacudo",
      "siririca",
      "transar",
      "vadia",
      "vagabunda",
      "vagabundo",
      "vagina",
      "vsf",
      "xana",
      "xaninha",
      "xavasca",
      "xereca",
      "xota",
      "xoxota",
    ],
  },
};

export default config;
