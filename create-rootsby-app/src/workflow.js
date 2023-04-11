// Workflows

// app.get('/workflow/list', async (req, res)=> {
const getWorkflowList = async (req, res) => {};

// app.get('/workflow/:name', async (req, res)=> {
const getWorkflow = async (req, res) => {};

// app.post('/workflow', async (req, res)=> {
const createOrUpdateWorkflow = async (req, res) => {};

// app.delete('/workflow', async (req, res)=> {
const deleteWorkflow = async (req, res) => {};

// app.get('/workflow/:name/call', async (req, res)=> {
const callWorkflow = async (req, res) => {};

exports = module.exports = {
  getWorkflowList,
  getWorkflow,
  createOrUpdateWorkflow,
  deleteWorkflow,
  callWorkflow,
};
