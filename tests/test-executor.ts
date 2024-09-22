import { WorkflowFunctionInput } from "../src/types";

export default function executor (input: WorkflowFunctionInput): unknown {
  
    return input.data;
}
