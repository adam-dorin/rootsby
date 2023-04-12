import {ExpressionParser} from "../src/utils/expression.parser";
import {ElementTypes, getElementType, ShortElementTypes} from "../src/utils/status.enum";


describe('Utils/ExpressionParser should...', () => {

    // test equality for primitive types
    test('Equality for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'eq')).toBe(true);
        expect(ExpressionParser.run(1, 2, 'eq')).toBe(false);
        expect(ExpressionParser.run('a', 'a', 'eq')).toBe(true);
        expect(ExpressionParser.run('a', 'b', 'eq')).toBe(false);
        expect(ExpressionParser.run(true, true, 'eq')).toBe(true);
        expect(ExpressionParser.run(true, false, 'eq')).toBe(false);
    });

    // test not for primitive types
    test('Not for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'not')).toBe(false);
        expect(ExpressionParser.run(1, 2, 'not')).toBe(true);
        expect(ExpressionParser.run('a', 'a', 'not')).toBe(false);
        expect(ExpressionParser.run('a', 'b', 'not')).toBe(true);
        expect(ExpressionParser.run(true, true, 'not')).toBe(false);
        expect(ExpressionParser.run(true, false, 'not')).toBe(true);
    });

    // test less than for primitive types
    test('Less than for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'lt')).toBe(false);
        expect(ExpressionParser.run(1, 2, 'lt')).toBe(true);
        expect(ExpressionParser.run('a', 'a', 'lt')).toBe(false);
        expect(ExpressionParser.run('a', 'b', 'lt')).toBe(true);
        expect(ExpressionParser.run(true, true, 'lt')).toBe(false);
        expect(ExpressionParser.run(true, false, 'lt')).toBe(false);
    });

    // test less than or equal for primitive types
    test('Less than or equal for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'lt_eq')).toBe(true);
        expect(ExpressionParser.run(1, 2, 'lt_eq')).toBe(true);
        expect(ExpressionParser.run('a', 'a', 'lt_eq')).toBe(true);
        expect(ExpressionParser.run('a', 'b', 'lt_eq')).toBe(true);
        expect(ExpressionParser.run(true, true, 'lt_eq')).toBe(true);
        expect(ExpressionParser.run(true, false, 'lt_eq')).toBe(false);
    });

    // test greater than for primitive types
    test('Greater than for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'gt')).toBe(false);
        expect(ExpressionParser.run(1, 2, 'gt')).toBe(false);
        expect(ExpressionParser.run('a', 'a', 'gt')).toBe(false);
        expect(ExpressionParser.run('a', 'b', 'gt')).toBe(false);
        expect(ExpressionParser.run(true, true, 'gt')).toBe(false);
        expect(ExpressionParser.run(true, false, 'gt')).toBe(true);
    });

    // test greater than or equal for primitive types
    test('Greater than or equal for primitive types', () => {
        expect(ExpressionParser.run(1, 1, 'gt_eq')).toBe(true);
        expect(ExpressionParser.run(1, 2, 'gt_eq')).toBe(false);
        expect(ExpressionParser.run('a', 'a', 'gt_eq')).toBe(true);
        expect(ExpressionParser.run('a', 'b', 'gt_eq')).toBe(false);
        expect(ExpressionParser.run(true, true, 'gt_eq')).toBe(true);
        expect(ExpressionParser.run(true, false, 'gt_eq')).toBe(true);
    });
});

describe('Utils/getElementType should...', () => {

    // test getElementType for ElementTypes.Unknown
    test('return ShortElementTypes.Unknown for random text', () => {
        expect(getElementType('text' as ElementTypes)).toBe(ShortElementTypes.Unknown);
    });

    // test getElementType for ElementTypes.Workflow
    test('return ShortElementTypes.Unknown for ElementTypes.Workflow', () => {
        expect(getElementType(ElementTypes.Workflow)).toBe(ShortElementTypes.Unknown);
    });

    // test getElementType for ElementTypes.Task
    test('return ShortElementTypes.Task for ElementTypes.Task', () => {
        expect(getElementType(ElementTypes.Task)).toBe(ShortElementTypes.Task);
    });

    // test getElementType for ElementTypes.Gate
    test('return ShortElementTypes.Gateway for ElementTypes.Gate', () => {
        expect(getElementType(ElementTypes.Gate)).toBe(ShortElementTypes.Gateway);
    });

    // test getElementType for ElementTypes.Signal
    test('return ShortElementTypes.Event for ElementTypes.Signal', () => {
        expect(getElementType(ElementTypes.Signal)).toBe(ShortElementTypes.Event);
    });

    // test getElementType for ElementTypes.EventEnd
    test('return ShortElementTypes.Event for ElementTypes.EventEnd', () => {
        expect(getElementType(ElementTypes.EventEnd)).toBe(ShortElementTypes.Event);
    });

    // test ExpressionParser.extractProperty for object property extraction
    test('extract property from object', () => {
        expect(ExpressionParser.extractProperty({a: 1}, 'a')).toBe(1);
    });

    // test ExpressionParser.extractProperty for nested object property extraction
    test('extract nested property from object', () => {
        expect(ExpressionParser.extractProperty({a: {b: 1}}, 'a.b')).toBe(1);
    });

    // test ExpressionParser.extractProperty for nested object property extraction with an invalid extractor
    test('extract nested property from object with an invalid extractor', () => {
        expect(ExpressionParser.extractProperty({a: {b: 1}}, 'a.c')).toBeUndefined();
    });

    // test ExpressionParser.extractProperty for nested object property extraction with an invalid extractor
    test('extract nested property from object with an invalid extractor that throws error', () => {
        try{
            expect(ExpressionParser.extractProperty({a: {b: 1}}, 'a.c.d')).toBeUndefined();
        } catch(e) {
            expect((e as any).message).toBe(`Invalid extractor c`);
        }
    });

});