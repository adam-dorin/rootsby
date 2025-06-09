import { ExprOp, WorkflowEvent, WorkflowType } from "../src/types";
import { WorkflowTestUtils } from "./utils";
import { Rootsby } from "../src/workflow";
import path from "path";
import executor from './test-executor';

describe("Workflows", () => {
  let longRunning: any;
  let shortRunning: any;
  beforeEach(() => {
    // observer = new Observable<boolean>();
    longRunning = WorkflowTestUtils.createWorkflowConfig({
      name: "test-workflow",
      type: WorkflowType.LongRunning,
    });
    shortRunning = WorkflowTestUtils.createWorkflowConfig({
      name: "test-workflow",
      type: WorkflowType.ShortRunning,
    });
  });

  // What are the test cases here?
  test("should start at the first function if no stepId is provided", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function1",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.startWorkflow],
      handler: (eventName: WorkflowEvent, data: any) => {
        expect(eventName).toBe(WorkflowEvent.startWorkflow);
        expect(data.functionId).toBe(f1.id);
        done();
      },
    });
    workflow.runWorkflow(shortRunning);
  });

  test("should start at the stepId function if stepId is provided", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.startWorkflow],
      handler: (eventName: WorkflowEvent, data: any) => {
        expect(eventName).toBe(WorkflowEvent.startWorkflow);
        expect(data.functionId).toBe(f2.id);
        done();
      },
    });
    workflow.runWorkflow(shortRunning, { currentStepId: f2.id });
  });

  // 1. Long running workflow => stop at every step and needs to be restarted specific where it was previously
  test("long running workflow should stop at every step", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    longRunning.functions = [f1, f2];
    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, data: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(data.functionId).toBe(f1.id);
        done();
      },
    });
    workflow.runWorkflow(longRunning);
  });

  // 2. Short running workflow => start from the beginning and end at the end
  test("short running workflow should stop at the end", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, data: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(data.functionId).toBe(f2.id);
        done();
      },
    });
    workflow.runWorkflow(shortRunning, { currentStepData: "test-value-to-evaluate" });
  });

  // 3. Middleware functions => run middleware functions at every step where they are defined ( 2 cases: with and without metadata)
  test("middleware functions should run at every step where defined", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
      middleware: ["middleman"],
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];
    const middlemanTString = "middle-man-state";
    const workflow = new Rootsby({
      middlewareFunctions: [
        {
          name: "middleman",
          executor: (input: any) => middlemanTString,
        },
      ],
    });
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, event: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(event.functionId).toBe(f2.id);
        expect(event.data).toBe(middlemanTString);
        done();
      },
    });
    workflow.runWorkflow(shortRunning, { currentStepData: "test-value-to-evaluate" });
  });
  
  test("functions from files should run at every step where defined", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
      file: path.resolve("./tests/test-executor.ts"), // "./test-executor.ts",
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, event: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(event.functionId).toBe(f2.id);
        expect(event.data).toBe("test-value-to-evaluate");
        done();
      },
    });
    workflow.runWorkflow(shortRunning, { currentStepData: "test-value-to-evaluate" });
  });
  // 5. Function references => run functions from references at every step where they are defined ( 2 cases: with and without metadata)
  test("functions from references should run at every step where defined", (done) => {
    const f1 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-1",
      // file: path.resolve("./tests/test-executor.ts"), // "./test-executor.ts",
      executor: executor,
    });
    const f2 = WorkflowTestUtils.createFunctionConfig({
      name: "test-function-2",
    });
    f1.next = [
      WorkflowTestUtils.createNextFunctionConfig({
        functionId: f2.id,
        values: [WorkflowTestUtils.createNextConditionConfig({ operator: ExprOp.eq, value: "test-value-to-evaluate" })],
      }),
    ];
    shortRunning.functions = [f1, f2];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, event: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(event.functionId).toBe(f2.id);
        expect(event.data).toBe("test-value-to-evaluate");
        done();
      },
    });
    workflow.runWorkflow(shortRunning, { currentStepData: "test-value-to-evaluate" });
  });

  test("middleware should receive metadata and emit events", (done) => {
    const fn = WorkflowTestUtils.createFunctionConfig({
      name: "meta-fn",
      middleware: ["logger"],
    });
    shortRunning.functions = [fn];

    const middlewareExecutor = jest.fn((input) => {
      expect(input.metadata).toEqual({ level: "debug" });
      return input.data;
    });

    const workflow = new Rootsby({
      middlewareFunctions: [
        {
          name: "logger",
          metadata: { level: "debug" },
          executor: middlewareExecutor,
        },
      ],
    });

    const events: WorkflowEvent[] = [];
    workflow.progress({
      events: [WorkflowEvent.beforeMiddleware, WorkflowEvent.afterMiddleware, WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent) => {
        events.push(eventName);
        if (eventName === WorkflowEvent.endWorkflow) {
          expect(middlewareExecutor).toHaveBeenCalled();
          expect(events).toContain(WorkflowEvent.beforeMiddleware);
          expect(events).toContain(WorkflowEvent.afterMiddleware);
          done();
        }
      },
    });

    workflow.runWorkflow(shortRunning);
  });

  test("function executor should receive metadata", (done) => {
    const fn = WorkflowTestUtils.createFunctionConfig({
      name: "meta-fn",
      executor: (input) => {
        expect(input.metadata).toEqual({ info: true });
        return "ok";
      },
      description: "", // filler
    });
    fn.metadata = { info: true };
    shortRunning.functions = [fn];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.endWorkflow],
      handler: (eventName: WorkflowEvent, event: any) => {
        expect(eventName).toBe(WorkflowEvent.endWorkflow);
        expect(event.data).toBe("ok");
        done();
      },
    });
    workflow.runWorkflow(shortRunning);
  });

  test("should emit error event when non primitive result returned", (done) => {
    const fn = WorkflowTestUtils.createFunctionConfig({
      name: "err-fn",
      executor: () => ({ obj: true }),
    });
    shortRunning.functions = [fn];

    const workflow = new Rootsby();
    workflow.progress({
      events: [WorkflowEvent.error],
      handler: (eventName: WorkflowEvent, event: any) => {
        expect(eventName).toBe(WorkflowEvent.error);
        expect(event.functionId).toBe(fn.id);
        expect(event.error).toBe("Invalid result type");
        done();
      },
    });
    workflow.runWorkflow(shortRunning);
  });

  test("runWorkflow should reject when file has no default export", async () => {
    const fn = WorkflowTestUtils.createFunctionConfig({
      name: "bad-fn",
      file: path.resolve("./tests/bad-executor.ts"),
    });
    shortRunning.functions = [fn];

    const workflow = new Rootsby();
    await expect(workflow.runWorkflow(shortRunning)).rejects.toEqual({
      content: "File content not found or not exported as default",
    });
  });
  // Additional tests added above cover metadata and error handling
});
