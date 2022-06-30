import config from "../../config.js";
import { getAllMatchesWithWord } from "../utilities/regexp.js";

class MessageBadwords {
  constructor(message) {
    this.message = message;
  }

  // TODO: Cache the result of getMatches method.
  getMatches() {
    const { badwords } = config.discord;
    const { content } = this.message;

    const matches = [];

    for (const badword of badwords) {
      for (const match of getAllMatchesWithWord(content, badword)) {
        matches.push(match);
      }
    }

    return matches;
  }
}

export default MessageBadwords;
