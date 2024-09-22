import { Observable } from "./observer";
import {
  MiddlewareExecutorInput,
  PrimitiveExpression,
  WorkflowCondition,
  WorkflowConfig,
  WorkflowEvent,
  WorkflowFunction,
  WorkflowFunctionInput,
  WorkflowFunctionsValidationResult,
  WorkflowMiddlewareFunction,
  WorkflowNextFunction,
  WorkflowType,
} from "./types";
import { WorkflowUtils } from "./workflow-utils";

/**
 * @internal 
 * @ignore 
 */
export class RootsbyInternals {
  public functionMap: Map<string, WorkflowFunction>;
  public middlewareFunctionMap: Map<string, WorkflowMiddlewareFunction>;
  public eventBus: Observable<unknown>;
  public config?: WorkflowConfig;

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

  public setMiddlewareConfig(middlewareFunctions: WorkflowMiddlewareFunction[] = []) {
    this.middlewareFunctionMap = new Map();
    middlewareFunctions.forEach((fn) => {
      this.middlewareFunctionMap.set(fn.name, fn);
    });
  }
  public setLogger(logger: (name: string, data: unknown) => void) {
    this.eventBus.setLogger(logger);
  }

  public endWorkflow(data?: { functionId: string; data: unknown }) {
    if (data) {
      this.eventBus.push(WorkflowEvent.endWorkflow, data);
    }
    this.config?.functions.forEach((fn) => {
      this.eventBus.unsubscribeAll(fn.id);
    });
  }

  public logErrorAndEndWorkflow(data: { functionId: string; data: unknown; error: string }): void {
    this.eventBus.push(WorkflowEvent.error, data);
    this.endWorkflow();
  }

  public validateNextFunctions(result: PrimitiveExpression, nextFunctions: WorkflowNextFunction[]): WorkflowFunctionsValidationResult {
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

  public advanceToNextFunction(functionId: string, result: unknown, nextValidFunctions: WorkflowNextFunction[]): void {
    const workflowFunction = this.functionMap.get(functionId);
    if (!workflowFunction) {
      throw new Error(`Function with id ${functionId} not found`);
    }

    for (const nextFunction of nextValidFunctions) {
      this.eventBus.push(nextFunction.functionId, result);
    }
  }

  public runMiddlewareFunctions(middlewareFunctionNames: string[], data: unknown): unknown {
    let result: unknown = data;
    for (const middlewareFunctionName of middlewareFunctionNames) {
      const middlewareFunction = this.middlewareFunctionMap.get(middlewareFunctionName);
      if (!middlewareFunction) {
        throw new Error(`Middleware function ${middlewareFunctionName} not found. Check if \`setMiddlewareConfig\` was called`);
      }
      this.eventBus.push(WorkflowEvent.beforeMiddleware, { middlewareFunctionName, data: result });
      const metadata = { ...(middlewareFunction.metadata ? middlewareFunction.metadata : {}) };
      result = middlewareFunction.executor({ metadata, data: result });
      this.eventBus.push(WorkflowEvent.afterMiddleware, { middlewareFunctionName, data: result });
    }
    return result;
  }

  public eventBusSubscriber(functionId: string): (data: unknown) => void {
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

      if (workflowFunction.executor && typeof workflowFunction.executor === "function") {
        const input: WorkflowFunctionInput = {
          data: result,
          metadata: workflowFunction.metadata ? workflowFunction.metadata : {},
        };
        result = (workflowFunction.executor as (data: WorkflowFunctionInput) => unknown)(input);
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

  public async loadFile(file: string): Promise<(input?: any) => any> {
    return new Promise(async (resolve, reject) => {
      try {
        const fileContent = await import(file);
        if (!fileContent || !fileContent.default) {
          throw new Error("File content not found or not exported as default");
        }
        resolve(fileContent.default as (data: unknown) => unknown);
      } catch (error) {
        reject({ content: (error as any).message });
      }
    });
  }
}
export class Rootsby {

  private int: RootsbyInternals;

  constructor(config?: { middlewareFunctions?: WorkflowMiddlewareFunction[]; logger?: (name: string, data: unknown) => void }) {
    this.int = new RootsbyInternals(config);
  }

  public async runWorkflow(config: WorkflowConfig, data?: { currentStepId?: string; currentStepData?: unknown }): Promise<void> {
    this.int.config = config;
    for (const workflowFunction of config.functions) {
      const functionId = workflowFunction.id;
      if (workflowFunction.file) {
        workflowFunction.executor = await this.int.loadFile(workflowFunction.file as string);
      }

      this.int.functionMap.set(functionId, workflowFunction);
      const subscriber = this.int.eventBusSubscriber(functionId);
      this.int.eventBus.subscribe(functionId, subscriber);
    }

    if (!data) {
      this.int.eventBus.push(WorkflowEvent.startWorkflow, { functionId: config.functions[0].id, data });
      this.int.eventBus.push(config.functions[0].id, null);
    }
    if (data && !data.currentStepId) {
      this.int.eventBus.push(WorkflowEvent.startWorkflow, { functionId: config.functions[0].id, data });
      this.int.eventBus.push(config.functions[0].id, data);
    }
    if (data && data.currentStepId) {
      this.int.eventBus.push(WorkflowEvent.startWorkflow, { functionId: data.currentStepId, data });
      this.int.eventBus.push(data.currentStepId, data.currentStepData);
    }
  }

  public progress({ events, handler }: { events?: WorkflowEvent[]; handler: (eventName: WorkflowEvent, data: unknown) => void }): void {
    let eventsFiltered = Object.values(WorkflowEvent);
    if (events) {
      eventsFiltered = eventsFiltered.filter((event) => events.includes(event as WorkflowEvent));
    }
    eventsFiltered.forEach((event) => {
      this.int.eventBus.subscribe(event, (data) => {
        handler(event as WorkflowEvent, data);
      });
    });
  }
}


// What are the test cases here?

// 1. Long running workflow => stop at every step and needs to be restarted specific where it was previously
// 2. Short running workflow => start from the beginning and end at the end
// 3. Middleware functions => run middleware functions at every step where they are defined ( 2 cases: with and without metadata)
// 4. Function files => run functions from files at every step where they are defined ( 2 cases: with and without metadata)
// 5. Function references => run functions from references at every step where they are defined ( 2 cases: with and without metadata)


// 1. Run a workflow from start to finish with the given data (type: short running)  
// 2. Run a workflow from start to finish with the given data and log all events (type: short running)

// 3. Run a workflow from a specific step with the given data and log all events (type: long running)
// 4. Run a workflow from start to finish with the given data and log specific events (type: long running)

// 5. Run a workflow with middleware functions and log all events (type: short running)
// 6. Run a workflow with middleware functions and log specific events (type: short running)

// 7. Run a workflow with middleware functions and log all events (type: long running)
// 8. Run a workflow with middleware functions and log specific events (type: long running)

// 9. Run a workflow with function files and log all events (type: long running)
// 10. Run a workflow with function files and log specific events (type: long running)

// 11. Run a workflow with function files and middleware functions and log all events (type: long running)
// 12. Run a workflow with function files and middleware functions and log specific events (type: long running)