import { Observable } from "./observer";
import {
  PrimitiveExpression,
  WorkflowCondition,
  WorkflowConfig,
  WorkflowEvent,
  WorkflowFunction,
  WorkflowFunctionsValidationResult,
  WorkflowMiddlewareFunction,
  WorkflowNextFunction,
  WorkflowType,
} from "./types";
import { WorkflowUtils } from "./workflow-utils";

/**
 *
 * Need to cover 2 cases for the workflow:
 *
 * 1. The Workflow is a long running workflow
 *
 * When the workflow is a long running workflow,
 * the workflow will be started and will stop and output its current state and step step.
 * The workflow will be started again from the last step.
 *
 * 2. The Workflow is a short running workflow
 * When the workflow is a short running workflow,
 * the workflow will be started and will run from function to function until the end.
 *
 */
export class Rootsby {
  private functionMap: Map<string, WorkflowFunction>;
  private middlewareFunctionMap: Map<string, WorkflowMiddlewareFunction>;
  private eventBus: Observable<unknown>;
  private config?: WorkflowConfig;

  constructor(config?: { middlewareFunctions?: WorkflowMiddlewareFunction[]; logger?: (name: string, data: unknown) => void }) {
    this.functionMap = new Map();
    this.middlewareFunctionMap = new Map();
    this.eventBus = new Observable<unknown>(false);

    if (config && config.middlewareFunctions) {
      this.setMiddlewareConfig(config.middlewareFunctions);
    }

    if (config && config.logger) {
      this.setLogger(config.logger);
    }
  }

  private setMiddlewareConfig(middlewareFunctions: WorkflowMiddlewareFunction[] = []) {
    this.middlewareFunctionMap = new Map();
    middlewareFunctions.forEach((fn) => {
      this.middlewareFunctionMap.set(fn.name, fn);
    });
  }
  private setLogger(logger: (name: string, data: unknown) => void) {
    this.eventBus.setLogger(logger);
  }

  private endWorkflow(data?: { functionId: string; data: unknown }) {
    if (data) {
      this.eventBus.push(WorkflowEvent.endWorkflow, data);
    }
    this.config?.functions.forEach((fn) => {
      this.eventBus.unsubscribeAll(fn.id);
    });
  }

  private logErrorAndEndWorkflow(data: { functionId: string; data: unknown; error: string }): void {
    this.eventBus.push(WorkflowEvent.error, data);
    this.endWorkflow();
  }

  private validateNextFunctions(result: PrimitiveExpression, nextFunctions: WorkflowNextFunction[]): WorkflowFunctionsValidationResult {
    if (typeof result !== "string" && typeof result !== "number" && typeof result !== "boolean") {
      return { error: true, results: [] };
    }
    const next = nextFunctions.filter((workflowNextFunction: WorkflowNextFunction) => {
      return workflowNextFunction.values
        .map((condition: WorkflowCondition) => {
          return WorkflowUtils.evaluateExpression(result as PrimitiveExpression, condition.value, condition.operator);
        })
        .every((value: boolean) => value === true);
    });
    return { error: false, results: next };
  }

  private advanceToNextFunction(functionId: string, result: unknown, nextValidFunctions: WorkflowNextFunction[]): void {
    const workflowFunction = this.functionMap.get(functionId);
    if (!workflowFunction) {
      throw new Error(`Function with id ${functionId} not found`);
    }

    for (const nextFunction of nextValidFunctions) {
      this.eventBus.push(nextFunction.functionId, result);
    }
  }

  private runMiddlewareFunctions(middlewareFunctionNames: string[], data: unknown): unknown {
    let result: unknown = data;
    for (const middlewareFunctionName of middlewareFunctionNames) {
      const middlewareFunction = this.middlewareFunctionMap.get(middlewareFunctionName);
      if (!middlewareFunction) {
        throw new Error(`Middleware function ${middlewareFunctionName} not found. Check if \`setMiddlewareConfig\` was called`);
      }
      this.eventBus.push(WorkflowEvent.beforeMiddleware, { middlewareFunctionName, data: result });
      result = middlewareFunction.executor(result);
      this.eventBus.push(WorkflowEvent.afterMiddleware, { middlewareFunctionName, data: result });
    }
    return result;
  }

  private eventBusSubscriber(functionId: string): (data: unknown) => void {
    return async (data: unknown) => {
      this.eventBus.push(WorkflowEvent.startStep, { functionId, data: data });
      let result: unknown = data;

      const workflowFunction = this.functionMap.get(functionId);
      if (!workflowFunction) {
        throw new Error(`Function with id ${functionId} not found`);
      }

      if (workflowFunction.middleware && workflowFunction.middleware.length > 0) {
        result = this.runMiddlewareFunctions(workflowFunction.middleware, result);
      }

      if (workflowFunction.file && typeof workflowFunction.file === "function") {
        // TODO: strengthen the type here
        result = (workflowFunction.file as (data: unknown) => unknown)(data);
      }

      const nextValid = this.validateNextFunctions(result as PrimitiveExpression, workflowFunction.next);
      this.eventBus.push(WorkflowEvent.endStep, { functionId, data: result });
      if (this.config && this.config.type === WorkflowType.LongRunning) {
        if (nextValid.error) {
          // throw new Error("Invalid result type");
          // TODO: make this error more descriptive
          this.logErrorAndEndWorkflow({ functionId, data: result, error: "Invalid result type" });
        }
        // output the current state and step, then end the workflow
        this.endWorkflow({ functionId, data: result });
      }

      if (this.config && this.config.type === WorkflowType.ShortRunning) {
        if (nextValid.error) {
          // throw new Error("Invalid result type");
          // TODO: make this error more descriptive
          this.logErrorAndEndWorkflow({ functionId, data: result, error: "Invalid result type" });
        }
        if (nextValid.results.length) {
          this.advanceToNextFunction(functionId, result, nextValid.results);
        } else {
          // output the current state and step, then end the workflow
          this.endWorkflow({ functionId, data: result });
        }
      }
    };
  }

  // TODO: add a type for the file loader | acctually make it work
  private async loadFile(file: string): Promise<(input?: any) => any> {
    return new Promise((resolve, reject) => {
      resolve(() => "world");
    });
  }

  public async runWorkflow(config: WorkflowConfig, data?: { currentStepId?: string; currentStepData?: unknown }): Promise<void> {
    this.config = config;
    this.eventBus.push(WorkflowEvent.startWorkflow, { config, data });
    for (const workflowFunction of config.functions) {
      const functionId = workflowFunction.id;
      if (workflowFunction.file) {
        workflowFunction.file = await this.loadFile(workflowFunction.file as string);
      }

      this.functionMap.set(functionId, workflowFunction);
      const subscriber = this.eventBusSubscriber(functionId);
      this.eventBus.subscribe(functionId, subscriber);
    }

    if (!data) {
      this.eventBus.push(config.functions[0].id, null);
    }
    if (data && !data.currentStepId) {
      this.eventBus.push(config.functions[0].id, data.currentStepData);
    }
    if (data && data.currentStepId) {
      this.eventBus.push(data.currentStepId, data.currentStepData);
    }
  }

  public progress(callback: (eventName: WorkflowEvent, data: unknown) => void): void {
    const events = Object.values(WorkflowEvent);
    events.forEach((event) => {
      this.eventBus.subscribe(event, (data) => {
        callback(event as WorkflowEvent, data);
      });
    });
  }
}

// a workflowConfig example with a single function and valid uuids
const config_: WorkflowConfig = {
  id: "uuid",
  name: "string",
  type: WorkflowType.ShortRunning,
  description: "string",
  functions: [
    {
      id: "uuid",
      name: "string",
      description: "string",
      file: "string", // loader
      middleware: ["middleman"],
      next: [
        {
          functionId: "uuid",
          values: [
            {
              operator: "eq",
              value: "string",
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  const config: WorkflowConfig = {
    id: "926cc4ce-36dc-4238-9e59-cae361710973",
    name: "string",
    type: WorkflowType.ShortRunning,
    description: "string",
    functions: [
      {
        id: "044ac245-f7b8-4a0f-84ea-ba3dfe494826",
        name: "string",
        description: "string",
        file: "string", // loader
        middleware: ["middleman"],
        next: [
          {
            functionId: "bf28b4ed-ca2b-4811-9999-f3f31bdc3e49",
            values: [
              {
                operator: "eq",
                value: "world",
              },
            ],
          },
        ],
      },
      {
        id: "bf28b4ed-ca2b-4811-9999-f3f31bdc3e49",
        name: "string",
        description: "string",
        file: "string", // loader
        middleware: ["middleman"],
        next: [
          {
            functionId: "uuid",
            values: [
              {
                operator: "eq",
                value: "string",
              },
            ],
          },
        ],
      },
    ],
  };
  const rootsby = new Rootsby({
    middlewareFunctions: [
      {
        name: "middleman",
        executor: (data: unknown) => {
          console.log("middleman:", data);
          return data;
        },
      },
    ],
    logger: (name, data) => {
      console.log("logger:>>>>", name, data);
    },
  });

  rootsby.progress((eventName: WorkflowEvent, data: unknown) => {
    console.log("progress:>>>>", eventName, data);
  });

  await rootsby.runWorkflow(config, { currentStepData: "hello" });
}
main();
