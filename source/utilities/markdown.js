import { bold } from "@discordjs/builders";

function boldSubstring(string, indexStart, indexEnd) {
  const substring = string.slice(indexStart, indexEnd);

  return string.replace(substring, bold(substring));
}

function boldSubstringFromMatch(string, match) {
  return boldSubstring(string, match.index, match[0].length);
}

export { boldSubstringFromMatch };
