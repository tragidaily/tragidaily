import config from "../../config.js";

function getRole(member, roleName) {
  const { roles } = config.discord;

  return member.roles.cache.get(roles[roleName].id);
}

function getChannel(client, channelName) {
  const { channels } = config.discord;

  return client.channels.cache.get(channels[channelName].id);
}

export { getRole, getChannel };
