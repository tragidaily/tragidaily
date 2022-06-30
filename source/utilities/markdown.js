import { bold } from "@discordjs/builders";

function boldSubstring(string, indexStart, indexEnd) {
  const substring = string.substring(indexStart, indexEnd);

  return string.replace(substring, bold(substring));
}

function boldSubstringFromMatch(string, match) {
  return boldSubstringFromMatch(string, match.index, match[0].length);
}
