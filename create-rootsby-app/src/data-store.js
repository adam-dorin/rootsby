const fs = require("fs");
const path = require("path");

const getInMemoryStore = (pathArgs = [], defultValue = {}) => {
  const promptStore = fs.readFileSync(path.join(...pathArgs));
  try {
    return JSON.parse(promptStore);
  } catch (e) {
    console.log("Error parsing prompts store");
    console.log(e);
    return defaultValue;
  }
};

const writeInMemoryStore = (pathArgs = [], data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(...pathArgs), JSON.stringify(data), (err) => {
      err ? reject(err) : resolve();
    });
  });
};

exports = module.exports = {
  getInMemoryStore,
  writeInMemoryStore,
};
