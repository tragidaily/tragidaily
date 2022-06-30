import * as confusables from "confusables";

function getAllMatchesWithWord(string, word) {
  // Remove confusables
  string = confusables.remove(string);
  word = confusables.remove(word);

  const regexp = new RegExp(`\\b${word}\\b`, "dgi");

  return Array.from(string.matchAll(regexp));
}

export { getAllMatchesWithWord };
