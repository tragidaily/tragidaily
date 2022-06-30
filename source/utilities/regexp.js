import * as confusables from "confusables";

function getAllMatchesWithWord(string, word) {
  // Remove confusables
  const newString = confusables.remove(string);
  const newWord = confusables.remove(word);

  // eslint-disable-next-line security/detect-non-literal-regexp
  const regexp = new RegExp(`\\b${newWord}\\b`, "dgiu");

  return Array.from(newString.matchAll(regexp));
}

export { getAllMatchesWithWord };
