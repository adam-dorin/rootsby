import { AndAlwaysPush, Observable } from "./observer";
import { ExpressionParser, PrimitiveExpression } from "./workflow-utils";

export type Operator = "eq" | "not" | "gt" | "lt" | "gt_eq" | "lt_eq";
export enum ExprOp {
  eq = "eq",
  not = "not",
  gt = "gt",
  lt = "lt",
  gt_eq = "gt_eq",
  lt_eq = "lt_eq",
}

type WorkflowCondition = {
  function_id: string;
  operator: Operator;
  value: any;
};

type FileLoader = Promise<string>;

type WorkflowFunction = {
  id: string;
  name: string;
  description?: string;
  file: string | Promise<() => any> | (() => any);
  next: WorkflowCondition[];
};
type WorkflowConfig = {
  id: string;
  name: string;
  description?: string;
  functions: WorkflowFunction[];
};

const config: WorkflowConfig = {
  id: "926cc4ce-36dc-4238-9e59-cae361710973",
  name: "string",
  description: "string",
  functions: [
    {
      id: "044ac245-f7b8-4a0f-84ea-ba3dfe494826",
      name: "string",
      description: "string",
      file: "string", // loader
      next: [
        {
          function_id: "bf28b4ed-ca2b-4811-9999-f3f31bdc3e49",
          operator: "eq",
          value: "string",
        },
      ],
    },
    {
      id: "bf28b4ed-ca2b-4811-9999-f3f31bdc3e49",
      name: "string",
      description: "string",
      file: "string", // loader
      next: [
        {
          function_id: "uuid",
          operator: "eq",
          value: "string",
        },
      ],
    },
  ],
};

function loadFile(file: string): Promise<(input?: any) => any> {
    return new Promise((resolve, reject) => {
      resolve(() => "world");
    });
  }
/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */
export async function runWorkflow(config: WorkflowConfig) {
  // config.functions.forEach((fn) => {
  const functionMap: { [name: string]: WorkflowFunction } = {};
  const eventBus = new Observable(false);
  let currentId;

  for (let i = 0; i < config.functions.length; i++) {
    const functionId = config.functions[i].id;
    functionMap[functionId] = config.functions[i];
    functionMap[functionId].file = await loadFile(functionMap[functionId].file as string);
    // fn.id
    if (!currentId) {
      currentId = functionId;
    }
    eventBus.subscribe(functionId, async (data) => {
      // const fileFunction = await loadFile(functionMap[functionId].file as string);
      if (typeof functionMap[functionId].file === "function") {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const result = (functionMap[functionId].file as Function)(data);
        
        const next =
        config.functions[i].next.filter((condition: WorkflowCondition) => {
          return ExpressionParser.run(result as PrimitiveExpression, condition.value, condition.operator);
        });
        if (next.length > 0) {
            for (let j = 0; j < next.length; j++) {
                eventBus.push(next[j].function_id, result);
            }
        }
      }
    });
  }
  return {
    start: (data: any) => {
      eventBus.push(config.functions[0].id, data);
    },
    end: () => {
      eventBus.unsubscribeAll(AndAlwaysPush);
      config.functions.forEach((fn) => {
        eventBus.unsubscribeAll(fn.id);
      });
    },
    pushLog: (logger: (data?: any) => void) => {
      eventBus.subscribe(AndAlwaysPush, logger);
    },
  };
}

// a workflowConfig example with a single function and valid uuids
const config_: WorkflowConfig = {
  id: "uuid",
  name: "string",
  description: "string",
  functions: [
    {
      id: "uuid",
      name: "string",
      description: "string",
      file: "string", // loader
      next: [
        {
          function_id: "uuid",
          operator: "eq",
          value: "string",
        },
      ],
    },
  ],
};

async function main() {
  const wf = await runWorkflow(config_)
  wf.pushLog((data) => {
    console.log('log::::',data);
  });
  wf.start("hello");
}
main();