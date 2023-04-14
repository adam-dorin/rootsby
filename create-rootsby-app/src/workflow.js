// Workflows
const path = require("path");

// app.get('/workflow/list', async (req, res)=> {
const getWorkflowList = async (req, res) => {};

// app.get('/workflow/:name', async (req, res)=> {
const getWorkflow = async (req, res) => {};

// app.post('/workflow', async (req, res)=> {
const createOrUpdateWorkflow = async (req, res) => {};

// app.delete('/workflow', async (req, res)=> {
const deleteWorkflow = async (req, res) => {};

// app.get('/workflow/:name/call', async (req, res)=> {
const callWorkflow = async (req, res) => {
  const {WorkFlow} = require("rootsby");
 
  const ll = {
    "workflow": {
      "id": "bc6ad544-b1df-4fff-8b81-ccd3764cb1a1",
      "description": "Description",
      "isActive": true,
      "isPublic": true,
      "workFlowStatus": "3",
      "workFlowStartElementId": "9a3e807e-39c8-4e23-a67c-00ddba21163b"
    },
    "elements": [
      {
        "id": "9a3e807e-39c8-4e23-a67c-00ddba21163b",
        "name": "name-100",
        "description": "This is a description",
        "state": {
          "type": "ScriptExecution",
          "data": JSON.stringify(path.join(__dirname,"../content", "scripts", "make_some_noise"))
        },
        "workFlowId": "bc6ad544-b1df-4fff-8b81-ccd3764cb1a1",
        "elementType": "Task",
        "statusId": "1",
        "nextElementId": null
      }
    ]
  };
  
  const workflow = new WorkFlow(ll);
  const executionLog = [];
  workflow.onLog(log => {
    executionLog.push(log);
  })

  workflow.start();
  workflow.on("End", (data) => {
    const error = executionLog.filter(log => log.Type === "Error");
    res.status(200).json({message:`Workflow ended with ${error.length} errors`,executionLog});
  });
};

exports = module.exports = {
  getWorkflowList,
  getWorkflow,
  createOrUpdateWorkflow,
  deleteWorkflow,
  callWorkflow,
};
