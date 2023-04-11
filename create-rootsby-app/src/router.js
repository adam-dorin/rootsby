const promptController = require("./prompt");
const scriptsController = require("./script");
const workflowController = require("./workflow");

function router(app) {
  app.get("/", function (req, res) {
    res.render("index", { title: "Markdown Example" });
  });

  // Prompts
  app.get("/prompt/list", promptController.getPromptList);
  app.get("/prompt/:name", promptController.getPrompt);
  app.post("/prompt", promptController.createOrUpdatePrompt);
  app.delete("/prompt", promptController.deletePrompt);

  // Scripts
  app.get("/script/list", scriptsController.getScriptList);
  app.get("/script/:name", scriptsController.getScript);
  app.post("/script", scriptsController.createOrUpdateScript);
  app.delete("/script", scriptsController.deleteScript);
  app.get("/script/:name/call", scriptsController.callScript);

  // Workflows
  app.get("/workflow/list", workflowController.getWorkflowList);
  app.get("/workflow/:name", workflowController.getWorkflow);
  app.post("/workflow", workflowController.createOrUpdateWorkflow);
  app.delete("/workflow", workflowController.deleteWorkflow);
  app.get("/workflow/:name/call", workflowController.callWorkflow);
}

exports = module.exports = router;
