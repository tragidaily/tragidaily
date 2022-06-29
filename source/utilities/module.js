import path from "node:path";

function getCurrentModuleFilename(importMetadata) {
  return new URL(importMetadata.url).pathname;
}

function getCurrentModuleDirname(importMetadata) {
  return path.dirname(getCurrentModuleFilename(importMetadata));
}

export { getCurrentModuleFilename, getCurrentModuleDirname };
