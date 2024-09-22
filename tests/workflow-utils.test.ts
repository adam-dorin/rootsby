import { ExprOp } from "../src/types";
import { WorkflowUtils } from "../src/workflow-utils";

describe('workflow-utils', () => {

    // export class WorkflowUtils {
    //     public static evaluateExpression(first: PrimitiveExpression, second: PrimitiveExpression, operator: ExprOperators): boolean {
    //       return ExpressionParser.run(first, second, operator);
    //     }
      
    //     public static extractProperty(obj: Record<string, unknown>, extractor: string | string[], delimiter = "."): unknown {
    //       return ExpressionParser.extractProperty(obj, extractor, delimiter);
    //     }
    //   }
    // beforeEach(() => {
   
    // });

    // utils evaluateExpression when operator is eq
    //   ✓ should return true when first and second are equal
    //   ✓ should return false when first and second are not equal
    test('utils evaluateExpression when operator is eq should return true when first and second are equal', () => {
        // Arrange
        const first = 1;
        const second = 1;
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.eq);
        // Assert
        expect(result).toBeTruthy();
    });
    test('utils evaluateExpression when operator is eq should return false when first and second are not equal', () => {
        // Arrange
        const first = 1;
        const second = 2;
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.eq);
        // Assert
        expect(result).toBeFalsy();
    });
    // utils evaluateExpression when operator is lt
    //   ✓ should return true when first is less than second
    //   ✓ should return false when first is not less than second
    test('utils evaluateExpression when operator is lt should return true when first is less than second', () => {
        // Arrange
        const first = 1;
        const second = 2;
        const operator = "";
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.lt);
        // Assert
        expect(result).toBeTruthy();
    });
    
    // utils evaluateExpression when operator is gt
    //   ✓ should return true when first is greater than second
    //   ✓ should return false when first is not greater than second
    test('utils evaluateExpression when operator is gt should return true when first is greater than second', () => {
        // Arrange
        const first = 2;
        const second = 1;
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.gt);
        // Assert
        expect(result).toBeTruthy();
    });
   
    // utils evaluateExpression when operator is gt_eq
    //   ✓ should return true when first is greater than or equal to second
    //   ✓ should return false when first is not greater than or equal to second
    test('utils evaluateExpression when operator is gt_eq should return true when first is greater than or equal to second', () => {
        // Arrange
        const first = 2;
        const second = 1;
        const operator = "gt_eq";
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.gt_eq);
        // Assert
        expect(result).toBeTruthy();
    });
    
    // utils evaluateExpression when operator is lt_eq
    //   ✓ should return true when first is less than or equal to second
    //   ✓ should return false when first is not less than or equal to second
    test('utils evaluateExpression when operator is lt_eq should return true when first is less than or equal to second', () => {
        // Arrange
        const first = 1;
        const second = 2;
        const operator = "lt_eq";
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.lt_eq);
        // Assert
        expect(result).toBeTruthy();
    });


    // utils evaluateExpression when operator is not
    //   ✓ should return true when first is not equal to second
    //   ✓ should return false when first is equal to second

    test('utils evaluateExpression when operator is not should return true when first is not equal to second', () => {
        // Arrange
        const first = 1;
        const second = 2;
        const operator = "not";
        // Act
        const result = WorkflowUtils.evaluateExpression(first, second, ExprOp.not);
        // Assert
        expect(result).toBeTruthy();
    });

    // utils extractProperty
    //   ✓ should return the value of the property
    //   ✓ should return the value of the nested property
    //   ✓ should return the value of the deeply nested property

    test('utils extractProperty should return the value of the property', () => {
        // Arrange
        const obj = { prop: "value" };
        const extractor = "prop";
        // Act
        const result = WorkflowUtils.extractProperty(obj, extractor);
        // Assert
        expect(result).toBe("value");
    });
    test('utils extractProperty should return the value of the nested property', () => {
        // Arrange
        const obj = { prop: { nested: "value" } };
        const extractor = "prop.nested";
        // Act
        const result = WorkflowUtils.extractProperty(obj, extractor);
        // Assert
        expect(result).toBe("value");
    });

    test('utils extractProperty should return the value of the deeply nested property', () => {
        // Arrange
        const obj = { prop: { nested: { deeply: "value" } } };
        const extractor = "prop.nested.deeply";
        // Act
        const result = WorkflowUtils.extractProperty(obj, extractor);
        // Assert
        expect(result).toBe("value");
    });

})