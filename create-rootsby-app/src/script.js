// Scripts
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
const { getInMemoryStore, writeInMemoryStore } = require("./data-store");

// { [name_of_script:string]: string }
// a map of script names to script paths;
const inMemoryScriptStorePath = [__dirname, "../content/scripts/store.json"];
const inMemoryScriptStore = getInMemoryStore(inMemoryScriptStorePath, {});

// app.get('/script/list', async (req, res)=> {
const getScriptList = async (req, res) => {
  const data = Object.keys(inMemoryScriptStore);
  res.status(200).json({ data });
};

// is this path necessary?
// app.get('/script/:name', async (req, res)=> {
const getScript = async (req, res) => {};

// app.post('/script', async (req, res)=> {
const createOrUpdateScript = async (req, res) => {
  try {
    const body = req.body;
    const scriptName = body.name;
    const scriptContent = body.content;
    if (!scriptName || !scriptContent) {
      res.status(400).send("Script name and content are required");
      return;
    }
    const scriptPath = path.join(
      __dirname,
      `../content/scripts/${scriptName}.js`
    );
    inMemoryScriptStore[scriptName] = scriptPath;
    await writeInMemoryStore(inMemoryScriptStorePath, inMemoryScriptStore);
    fs.writeFile(scriptPath, scriptContent, (err) => {
      if (err) {
        res.status(500).send("Error writing script");
        return;
      }
      res.status(200).send("Script created");
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Error creating script");
  }
};

// app.delete('/script', async (req, res)=> {
const deleteScript = async (req, res) => {
  const name = req.params.name;
  if (!inMemoryScriptStore[name]) {
    res.status(404).send(`Script ${name} not found`);
    return;
  }
  delete inMemoryScriptStore[name];
  const scriptPath = path.join(__dirname, `../content/scripts/${name}.js`);
  fs.unlink(scriptPath, (err) => {
    if (err) {
      res.status(500).send("Error deleting script");
      return;
    }
    res.status(200).send("Script deleted");
  });
};

// app.get('/script/:name/call', async (req, res)=> {
const callScript = async (req, res) => {
  const scriptName = req.params.name;
  const scriptPath = inMemoryScriptStore[scriptName];
  if (!scriptPath) {
    res.status(404).send(`Script ${scriptName} not found`);
    return;
  }
  const script = require(scriptPath);
  const result = await script(req.body);
  res.status(200).json(result);
};

exports = module.exports = {
  getScriptList,
  getScript,
  createOrUpdateScript,
  deleteScript,
  callScript,
};
