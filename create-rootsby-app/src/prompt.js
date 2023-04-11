// Prompts

// app.get('/prompt/list', async (req, res)=> {
const getPromptList = async (req, res) => {};

// app.get('/prompt/:name', async (req, res)=> {
const getPrompt = async (req, res) => {};

// app.post('/prompt', async (req, res)=> {
const createOrUpdatePrompt = async (req, res) => {};

// app.delete('/prompt', async (req, res)=> {
const deletePrompt = async (req, res) => {};

exports = module.exports = {
  getPromptList,
  getPrompt,
  createOrUpdatePrompt,
  deletePrompt,
};
