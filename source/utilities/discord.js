import config from "../../config.js";

function getRoleByName(member, roleName) {
  const { roles } = config.discord;

  return member.roles.cache.get(roles[roleName].id);
}

function getChannelByName(client, channelName) {
  const { channels } = config.discord;

  return client.channels.cache.get(channels[channelName].id);
}

function getChannelIdByName(channelName) {
  const { channels } = config.discord;

  return channels[channelName].id;
}

export { getRoleByName, getChannelByName, getChannelIdByName };
