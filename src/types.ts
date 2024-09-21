export type PrimitiveExpression = string | number | boolean;
export type ExprOperators = "eq" | "not" | "gt" | "lt" | "gt_eq" | "lt_eq";

export type WorkflowCondition = {
  operator: ExprOperators;
  value: PrimitiveExpression;
};

export type FileLoader = Promise<string>;

export type MiddlewareExecutorInput = { data: unknown; metadata: Record<string, unknown> };
export type WorkflowMiddlewareFunction = {
  name: string;
  metadata?: Record<string, unknown>;
  executor: (data: MiddlewareExecutorInput) => unknown;
};

export type WorkflowConfig = {
  id: string;
  name: string;
  type: WorkflowType;
  description?: string;
  functions: WorkflowFunction[];
};

export type WorkflowFunctionInput = { data: unknown; metadata?: Record<string, unknown> };

export type WorkflowFunction = {
  id: string;
  name: string;
  description?: string;
  middleware?: string[];
  metadata?: Record<string, unknown>;
  file?: string | Promise<(data: WorkflowFunctionInput) => unknown>;
  executor?: (data: WorkflowFunctionInput) => unknown;
  next: WorkflowNextFunction[];
};

export type WorkflowNextFunction = {
  functionId: string;
  values: WorkflowCondition[];
};
export type WorkflowFunctionsValidationResult = {
  error: boolean;
  results: WorkflowNextFunction[];
};

export type WorkflowConfigInput = { name?: string; type?: WorkflowType; description?: string; functions?: WorkflowFunction[] };
export type WorkflowFunctionConfigInput = { name?: string; description?: string; file: string; middleware?: string[]; next?: WorkflowNextFunction[] };

export enum WorkflowEvent {
  startWorkflow = "startWorkflow",
  endWorkflow = "endWorkflow",
  startStep = "startStep",
  endStep = "endStep",
  beforeMiddleware = "beforeMiddleware",
  afterMiddleware = "afterMiddleware",
  error = "error",
}

/**
 * @description Equals **===**  => **eq**
 * @description Is different( **!==** ) => **not**
 * @description Greater than( **>** ) => **gt**
 * @description Less than( **<** ) => **lt**
 * @description Greater or equal than **>=** => **gt_eq**
 * @description Lesser or equal than **<=**  => **lt_eq**
 */
export enum ExprOp {
  eq = "eq",
  not = "not",
  gt = "gt",
  lt = "lt",
  gt_eq = "gt_eq",
  lt_eq = "lt_eq",
}
export enum WorkflowType {
  LongRunning = "LongRunning",
  ShortRunning = "ShortRunning",
}
