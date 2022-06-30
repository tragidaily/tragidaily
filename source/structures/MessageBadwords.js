import config from "../../config.js";
import { getAllMatchesWithWord } from "../utilities/regexp.js";

// TODO: Cache the result of getMatches method.

class MessageBadwords {
  constructor(message) {
    this.message = message;
  }

  get() {
    const { badwords } = config.discord;
    const { content } = this.message;

    const matches = [];

    for (const badword of badwords) {
      for (const match of getAllMatchesWithWord(content, badword)) {
        matches.push({ string: match[0], indices: match.indices });
      }
    }

    return matches;
  }
}

export default MessageBadwords;
