export type PrimitiveExpression = string | number | boolean;
export type ExprOperators = 'eq' | 'not' | 'gt' | 'lt' | 'gt_eq' | 'lt_eq';

/**
 * @description Equals **===**  => **eq**
 * @description Is different( **!==** ) => **not**
 * @description Greater than( **>** ) => **gt**
 * @description Less than( **<** ) => **lt**
 * @description Greater or equal than **>=** => **gt_eq**
 * @description Lesser or equal than **<=**  => **lt_eq**
 */
export enum ExprOp {
    eq = 'eq',
    not = 'not',
    gt = 'gt',
    lt = 'lt',
    gt_eq = 'gt_eq',
    lt_eq = 'lt_eq'
}

type EngineSignature = { [name in ExprOperators]: (first: PrimitiveExpression, second: PrimitiveExpression) => boolean };

export class ExpressionParser {

    private static readonly engine: EngineSignature = {
        eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first === second,
        not: (first: PrimitiveExpression, second: PrimitiveExpression) => first !== second,
        lt: (first: PrimitiveExpression, second: PrimitiveExpression) => first < second,
        gt: (first: PrimitiveExpression, second: PrimitiveExpression) => first > second,
        gt_eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first >= second,
        lt_eq: (first: PrimitiveExpression, second: PrimitiveExpression) => first <= second
    };

    public static run(first: PrimitiveExpression, second: PrimitiveExpression, operator: ExprOperators): boolean {
        return ExpressionParser.engine[operator](first, second);
    }

    public static extractProperty(obj: Record<string, unknown>, extractor: string | string[], delimiter = '.'): unknown { // TODO: still need to add tests for this
        let runExtractor: string[];
        if (typeof extractor === 'string') {
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

