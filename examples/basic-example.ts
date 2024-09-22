import { ExprOp, WorkflowConfig, WorkflowEvent, WorkflowFunctionInput, WorkflowType } from "../src/types";
import { Rootsby } from "../src/workflow";

export function basicExample() {
  const id1 = crypto.randomUUID();
  const id2 = crypto.randomUUID();

  const someValue = "test-value-to-evaluate";
  const configuration: WorkflowConfig = {
    id: crypto.randomUUID(),
    name: "test-workflow",
    type: WorkflowType.ShortRunning,
    functions: [
      {
        id: id1,
        name: "test-function-1",
        executor: (input: WorkflowFunctionInput) => {
          console.log(input);
          return input.data;
        },
        next: [
          {
            functionId: id2,
            values: [{ operator: ExprOp.eq, value: someValue }],
          },
        ],
      },
      {
        id: id2,
        name: "test-function-2",
        next: [],
      },
    ],
  };

  const workflow = new Rootsby();
  workflow.progress({
    events: [WorkflowEvent.startWorkflow, WorkflowEvent.endWorkflow, WorkflowEvent.startStep, WorkflowEvent.endStep],
    handler: (eventName: WorkflowEvent, data: any) => {
      console.log(eventName, data);
    },
  });
  workflow.runWorkflow(configuration, { currentStepData: "test-value-to-evaluate" });
}
