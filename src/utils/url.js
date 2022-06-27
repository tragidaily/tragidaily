import { test, find } from "linkifyjs";

function isURL(string) {
  return test(string, "url");
}

function checkURL(string) {
  if (!isURL(string)) {
    const error = new TypeError("Invalid URL");

    error.input = string;
    error.code = "ERR_INVALID_URL";

    throw error;
  }
}

function hasURL(string) {
  return find(string, "url").length > 0;
}

export { checkURL, hasURL };
