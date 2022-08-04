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
      denounceChannel: "1004494433070350506",
      suggestionChannel: "865422754948579329",
      newsChannels: {
        tc_diario: "968689805762367558",
        jornal_local: "921501414847545394",
        militadas_erradas: "961176960086720532"
      },
      onlyMediaChannels: [
        "961176960086720532", 
        "864730261588803605", 
        "961171907137392720",
        "961176833343246348"
      ],
      unrestrictedChannels: ["961172391529160734", "961176833343246348"],
      reportChannel: "985892812396572734"
    },

    roles: {
      jornalistaInvestigativo: {
        id: "968688946043310150",
      },
      sub: {
        id: "921739642313785344"
      },
      patrocinador: {
        id: "986208551376678922"
      }
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

module.exports = config;