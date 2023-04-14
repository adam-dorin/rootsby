import {
    mockGateData,
    mockInvalidConditionsGateData,
    mockInvalidGateData,
    mockInvalidStateGateData,
    mockNullGateData
} from "./mocks/workflow-data.mock";
import {Gate} from "../src/gate.element";
import {AndAlwaysPush, Observable} from "../src/utils/event.observer";
import {DataEvent, GateCondition} from "../src/types/workflow.type";
import {EventTypes} from "../src/utils/status.enum";
import {filterLogsByType, writeJsonLogs} from "./mocks/utils.mocks";

describe('Gate should...', () => {
    let observer: Observable<DataEvent>;
    let logs: DataEvent[];
    beforeEach(() => {
        logs = [];
        observer = new Observable<DataEvent>();
        observer.subscribe(AndAlwaysPush, log => {
            logs.push(log);
        })
    })
    // 1. Push a filtered list on end for a valid condition list
    test('Push a filtered list on end for a valid condition list', done => {
        const gateData = mockGateData();
        const gateInstance = new Gate(gateData.gate, observer);
        observer.subscribe(`Element:${gateInstance.data.id}:${EventTypes.End}`, data => {
            try {
                const output: GateCondition[] = JSON.parse(data.data.output as string) as GateCondition[];
                expect(output.length).toBe(1);
                expect(output[0].nextElementId).toBe(gateData.elTrue);
                expect(output[0].nextElementId).not.toBe(gateData.elFalse);
                done();
            } catch (e) {
                done(e);
            }
        })
        gateInstance.start(gateData.event);
    })
    // 2. Error and End if the input is undefined
    test('Error and End if the input is undefined', done => {
        const gateData = mockNullGateData();
        const gateInstance = new Gate(gateData.gate, observer);

        observer.subscribe(`Element:${gateInstance.data.id}:${EventTypes.End}`, data => {
            try {
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(data.data.output).toBe(null);
                done();
            } catch (e) {
                done(e);
            }
        })
        gateData.event.data.output = null;
        gateInstance.start(gateData.event);
    })
    // 3. Error and End if the State can't be parsed
    test('Error and End if the State can\'t be parsed', done => {
        const gateData = mockInvalidStateGateData();
        const gateInstance = new Gate(gateData.gate, observer);
        observer.subscribe(`Element:${gateInstance.data.id}:${EventTypes.End}`, data => {
            try {
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(data.data.output).toBe(null);
                done();
            } catch (e) {
                done(e);
            }
        })
        gateInstance.start(gateData.event);
    })
    // 4. Error and End if any Condition is invalid
    // 5. Error and End operations fail
    test('Error and End if any operation fails', done => {
        const gateData = mockInvalidConditionsGateData();
        const gateInstance = new Gate(gateData.gate, observer);

        observer.subscribe(`Element:${gateInstance.data.id}:${EventTypes.End}`, data => {
            try {
                // writeJsonLogs(logs);
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(data.data.output).toBe(null);
                done();
            } catch (e) {
                done(e);
            }
        })
        gateInstance.start(gateData.event);
    })
    // 6. Error and End if the input is doesn't produce an Output
    test('Error and End if the input is doesn\'t produce an Output', done => {
        const gateData = mockInvalidGateData();
        const gateInstance = new Gate(gateData.gate, observer);
        observer.subscribe(`Element:${gateInstance.data.id}:${EventTypes.End}`, data => {
            try {
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(data.data.output).toBe(null);
                done();
            } catch (e) {
                done(e);
            }
        })
        gateInstance.start(gateData.event);
    })
})
