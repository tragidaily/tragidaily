const { discord } = require("../config")
const { channels } = discord;

function linkCheck (msg) {
    for (let ch of channels.onlyMediaChannels) {
        if (msg.channelId == ch) {
            let rg =
            /(http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/;
          if (!msg.attachments.firstKey() && !msg.content.match(rg)) {
            return true;
          }
        }
    }
    return false;
}

module.exports = {
    name: 'linkCheck',
    call: linkCheck
};