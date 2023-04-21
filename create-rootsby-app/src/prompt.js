// Prompts
const path = require("path");
const uuid = require("uuid");
let defaultExecutor;

const { db } = require("./db");
// app.get('/prompt/list', async (req, res)=> {
const getPromptList = async (req, res) => {
  const data = await db().all("SELECT * FROM prompts");
  res.status(200).json({ data });
};

const getThreadList = async (req, res) => {
  const data = await db().all("SELECT * FROM threads");

  res.status(200).json({ data });
};

// app.get('/prompt/:name', async (req, res)=> {
const getPrompt = async (req, res) => {
  const promptName = req.params.name;
  const prompt = await db().get(
    "SELECT * FROM prompts WHERE name = ?",
    promptName
  );
  console.log(prompt);
  if (prompt) {
    res.status(200).json(prompt);
  } else {
    res.status(404).send(`Prompt ${promptName} not found`);
  }
};
const getThread = async (req, res) => {
  const threadId = req.params.id;
  const thread = await db().get("SELECT * FROM threads WHERE id = ?", threadId);
  const messages = await db().all(
    "SELECT * FROM messages WHERE threadId = ? ORDER BY created_on",
    threadId
  );

  if (thread) {
    res.status(200).json({ ...thread, messages });
  } else {
    res.status(404).send(`Thread ${threadId} not found`);
  }
};

// app.post('/prompt/:name/execute', async (req, res)=> {
const executePrompt = async (req, res) => {
  const promptName = req.params.name;
  const body = req.body;
  const prompt = await db().get(
    "SELECT * FROM prompts WHERE name = ?",
    promptName
  );

  if (!prompt) {
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
    system: prompt.content,
    chatConfig: body.chatConfig || {},
  };
  let id = body.threadId || uuid.v4();
  const thread = await db().get("SELECT * FROM threads WHERE id = ?", id);
  if (!thread) {
    await db().run(
      "INSERT INTO threads (id, name, promptId) VALUES (?, ?, ?)",
      id,
      "new Thread",
      prompt.id
    );
    // insert system message and user message into messages table
    await db().run(
      "INSERT INTO messages (id, threadId, author, name, message, created_on) VALUES (?, ?, ?, ?, ?, ?)",
      uuid.v4(),
      id,
      "system",
      "system",
      config.system,
      new Date().getTime()
    );
    await db().run(
      "INSERT INTO messages (id, threadId, author, name, message, created_on) VALUES (?, ?, ?, ?, ?, ?)",
      uuid.v4(),
      id,
      "user",
      "user",
      body.text,
      new Date().getTime()
    );
  } else {
    await db().run(
      "INSERT INTO messages (id, threadId, author, name, message, created_on) VALUES (?, ?, ?, ?, ?, ?)",
      uuid.v4(),
      id,
      "user",
      "user",
      body.text,
      new Date().getTime()
    );
  }

  try {
    console.log("Executing prompt");
    // order by created_on
    const messages = await db().all(
      "SELECT * FROM messages WHERE threadId = ? ORDER BY created_on",
      id
    );
    console.log(messages);
    const result = await defaultExecutor(
      config,
      messages.map((m) => ({ role: m.author, content: m.message }))
    );
    if (!result) {
      return res.status(500).json({ message: "Error executing prompt" });
    }
    // insert assistant message into messages table
    const respMsg = {
      id: uuid.v4(),
      threadId: id,
      author: "assistant",
      name: "assistant",
      message: result,
      created_on: new Date().getTime(),
    };
    await db().run(
      "INSERT INTO messages (id, threadId, author, name, message, created_on) VALUES (?, ?, ?, ?, ?, ?)",
      respMsg.id,
      respMsg.threadId,
      respMsg.author,
      respMsg.name,
      respMsg.message,
      respMsg.created_on
    );

    res.status(200).json(respMsg);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error executing prompt" });
  }
};

// app.post('/prompt', async (req, res)=> {
const createOrUpdatePrompt = async (req, res) => {
  // {name: string, prompt: {content: string, model:'openai-chatgpt-davinci-3'} }
  try {
    const { name, model, content } = req.body;

    if (!name || !model || !content) {
      res.status(400).send("Invalid prompt");
      return;
    }
    const prompt = await db().get("SELECT * FROM prompts WHERE name = ?", name);
    if (prompt) {
      await db().run(
        "UPDATE prompts SET id = ?, model = ?, content = ? WHERE name = ?",
        uuid.v4(),
        model,
        content,
        name
      );
    } else {
      await db().run(
        "INSERT INTO prompts (name, model, content) VALUES (?, ?, ?)",
        name,
        model,
        content
      );
    }

    res.status(201).json({ message: `Prompt ${name} created or updated` });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "General Error" });
  }
};

// app.delete('/prompt', async (req, res)=> {
const deletePrompt = async (req, res) => {
  try {
    const promptName = req.params.name;

    const prompt = await db().get(
      "SELECT * FROM prompts WHERE name = ?",
      promptName
    );
    if (!prompt) {
      res.status(404).send(`Prompt ${promptName} not found`);
      return;
    }
    await db().run("DELETE FROM prompts WHERE name = ?", promptName);
    res.status(200).json({ message: `Prompt ${promptName} deleted` });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "General Error" });
  }
};

exports = module.exports = {
  getPromptList,
  getPrompt,
  getThreadList,
  getThread,
  executePrompt,
  createOrUpdatePrompt,
  deletePrompt,
};
