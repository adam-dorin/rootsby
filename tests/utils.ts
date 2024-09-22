import * as crypto from "crypto";
import {
  ExprOperators,
  PrimitiveExpression,
  WorkflowCondition,
  WorkflowConfig,
  WorkflowConfigInput,
  WorkflowFunction,
  WorkflowFunctionConfigInput,
  WorkflowNextFunction,
  WorkflowType,
} from "../src/types";

export class WorkflowTestUtils {
  public static createWorkflowConfig({ name, type, description, functions }: WorkflowConfigInput): WorkflowConfig {
    const id = crypto.randomUUID();
    const config: WorkflowConfig = {
      id: id,
      name: name || id,
      type: type || WorkflowType.ShortRunning,
      description: description || "",
      functions: functions || [],
    };
    return config;
  }

  public static createFunctionConfig({ name, description, file, middleware, next, executor }: WorkflowFunctionConfigInput): WorkflowFunction {
    const id = crypto.randomUUID();
    const func: WorkflowFunction = {
      id: id,
      name: name || id,
      description: description || "",
      executor: executor ? executor : undefined,
      file: file,
      middleware: middleware,
      next: next || [],
    };
    return func;
  }

  public static createNextFunctionConfig({ functionId, values }: WorkflowNextFunction): WorkflowNextFunction {
    const nextFunc: WorkflowNextFunction = {
      functionId: functionId,
      values: values || [],
    };
    return nextFunc;
  }

  public static createNextConditionConfig({ operator, value }: { operator: ExprOperators; value: PrimitiveExpression }): WorkflowCondition {
    const condition: WorkflowCondition = {
      operator: operator,
      value: value,
    };
    return condition;
  }
}
