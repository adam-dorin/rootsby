import {
  ExprOperators,
  PrimitiveExpression,
} from "./types";

type EngineSignature = { [name in ExprOperators]: (first: PrimitiveExpression, second: PrimitiveExpression) => boolean };

class ExpressionParser {
  private static readonly engine: EngineSignature = {
    eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first === second,
    not: (first: PrimitiveExpression, second: PrimitiveExpression) => first !== second,
    lt: (first: PrimitiveExpression, second: PrimitiveExpression) => first < second,
    gt: (first: PrimitiveExpression, second: PrimitiveExpression) => first > second,
    gt_eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first >= second,
    lt_eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first <= second,
  };

  public static run(first: PrimitiveExpression, second: PrimitiveExpression, operator: ExprOperators): boolean {
    return ExpressionParser.engine[operator](first, second);
  }

  public static extractProperty(obj: Record<string, unknown>, extractor: string | string[], delimiter = "."): unknown {
    // TODO: still need to add tests for this
    let runExtractor: string[];
    if (typeof extractor === "string") {
      runExtractor = extractor.split(delimiter);
    } else {
      runExtractor = extractor;
    }
    const currentDepthKey = runExtractor.splice(0, 1)[0];

    if (!obj[currentDepthKey] && runExtractor.length > 0) {
      throw new Error(`Invalid extractor ${currentDepthKey}`);
    }
    if (runExtractor.length === 0) {
      return obj[currentDepthKey];
    } else {
      return ExpressionParser.extractProperty(obj[currentDepthKey] as Record<string, unknown>, runExtractor);
    }
  }
}

export class WorkflowUtils {
  public static evaluateExpression(first: PrimitiveExpression, second: PrimitiveExpression, operator: ExprOperators): boolean {
    return ExpressionParser.run(first, second, operator);
  }

  public static extractProperty(obj: Record<string, unknown>, extractor: string | string[], delimiter = "."): unknown {
    return ExpressionParser.extractProperty(obj, extractor, delimiter);
  }
}
