# Rootsby
It's still a work in progress.<br/>
The main idea is to able to run scripts in the form of workflows, with some decision-making included in the logic of the workflow. <br/>
All this can be done in a simple way, without the need to write code, just by creating a JSON file that describes the workflow.<br/>
With the help of the events it can be easily integrated with other services<br/>


```typescript
// Example of how to use the library
import {Rootsby} from 'rootsby/workflow';
import {WorkflowConfig, WorkflowType, WorkflowFunctionInput, ExprOp, WorkflowEvent} from 'rootsby/types';


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
```
