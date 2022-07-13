const fs = require("node:fs");
const mainFunctions = {};
const mainFunctionsFiles = fs
  .readdirSync("./mainFunctions")
  .filter((file) => file.endsWith(".js"));

for (const file of mainFunctionsFiles) {
  const func = require(`./mainFunctions/${file}`);
  mainFunctions[func.name] = func.call;
}

console.log(mainFunctions);