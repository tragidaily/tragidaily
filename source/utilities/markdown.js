import { bold } from "@discordjs/builders";

function boldSubstring(string, indexStart, indexEnd) {
  const substring = string.slice(indexStart, indexEnd);

  return string.replace(substring, bold(substring));
}

// TODO: Não tá muito grande?
function boldSubstringFromMessageBadword(string, messageBadword) {
  return boldSubstring(string, match.indices[0], match.indices[1]);
}

export { boldSubstringFromMessageBadword };
