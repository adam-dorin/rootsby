// Prompts
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
let defaultExecutor;

const getInMemoryPromptStore = () => {
  const promptStore = fs.readFileSync(
    path.join(__dirname, "../content/prompts/store.json")
  );
  try {
    return JSON.parse(promptStore);
  } catch (e) {
    console.log("Error parsing prompts store");
    console.log(e);
    return {
      prompts: {},
      threads: {},
    };
  }
};
const inMemoryPromptStore = getInMemoryPromptStore();

// app.get('/prompt/list', async (req, res)=> {
const getPromptList = async (req, res) => {
  const data = Object.keys(inMemoryPromptStore.prompts).map((key) => {
    return { name: key, prompt: inMemoryPromptStore[key] };
  });
  res.status(200).json({ data });
};

// app.get('/prompt/:name', async (req, res)=> {
const getPrompt = async (req, res) => {
  const promptName = req.params.name;
  const prompt = inMemoryPromptStore.prompts[promptName];

  if (prompt) {
    res.json(prompt);
  } else {
    res.status(404).send(`Prompt ${promptName} not found`);
  }
};

// app.post('/prompt/:name/execute', async (req, res)=> {
const executePrompt = async (req, res) => {
  const promptName = req.params.name;
  const body = req.body;
  const promptBody = inMemoryPromptStore.prompts[promptName];
  if (!promptBody) {
    res.status(404).send(`Prompt ${promptName} not found`);
    return;
  }
  if (!defaultExecutor) {
    defaultExecutor = require(path.join(
      __dirname,
      "../content/scripts/openai.js"
    ));
  }

  const config = {
    apiKey: process.env.OPEN_AI_KEY,
    system: promptBody.content,
    chatConfig: body.chatConfig || {},
  };
  let id = body.threadId || uuid.v4();
  if (!inMemoryPromptStore.threads[body.threadId]) {
    inMemoryPromptStore.threads[id] = [
      { role: "system", content: config.system },
      { role: "user", content: body.text },
    ];
  } else {
    inMemoryPromptStore.threads[body.threadId].push({
      role: "user",
      content: body.text,
    });
  }
  try {
    console.log("Executing prompt");
    console.log(inMemoryPromptStore.threads[id]);
    console.log(inMemoryPromptStore.threads);
    // config: { apiKey: string, system: string, chatConfig: object },  messages: array
    const result = await defaultExecutor(
      config,
      inMemoryPromptStore.threads[id]
    );
    if(!result) {
      return res.status(500).json({ message: "Error executing prompt" });
    }
    const responseMessage = { role: "assistant", content: result };
    inMemoryPromptStore.threads[id].push(responseMessage);

    fs.writeFile(
      path.join(__dirname, "../content/prompts/store.json"),
      JSON.stringify(inMemoryPromptStore),
      (err) => {
        console.log(err);
        res.status(200).json({
          threadId: id,
          reply: responseMessage
        });
      }
    );

   
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error executing prompt" });
  }
};

// app.post('/prompt', async (req, res)=> {
const createOrUpdatePrompt = async (req, res) => {
  // {name: string, prompt: {content: string, model:'openai-chatgpt-davinci-3'} }

  const promptName = req.body.name;
  const prompt = req.body.prompt;

  inMemoryPromptStore.prompts[promptName] = prompt;
  console.log(path.join(__dirname, "../content/prompts/store.json"));
  fs.writeFile(
    path.join(__dirname, "../content/prompts/store.json"),
    JSON.stringify(inMemoryPromptStore),
    (err) => {
      console.log(err);
      res
        .status(201)
        .json({ message: `Prompt ${promptName} created or updated` });
    }
  );
};

// app.delete('/prompt', async (req, res)=> {
const deletePrompt = async (req, res) => {
  const promptName = req.params.name;

  if (!inMemoryPromptStore.prompts[promptName]) {
    res.status(404).send(`Prompt ${promptName} not found`);
    return;
  }
  console.log(inMemoryPromptStore);
  delete inMemoryPromptStore.prompts[promptName];
  fs.writeFile(
    path.join(__dirname, "../content/prompts/store.json"),
    JSON.stringify(inMemoryPromptStore),
    (err) => {
      res.status(200).json({ message: `Prompt ${promptName} deleted` });
    }
  );
};

exports = module.exports = {
  getPromptList,
  getPrompt,
  executePrompt,
  createOrUpdatePrompt,
  deletePrompt,
};
