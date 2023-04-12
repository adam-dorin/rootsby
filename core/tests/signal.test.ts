import {mockSignal_Simple} from "./mocks/workflow-data.mock";
import {Signal} from "../src/signal.element";
import {AndAlwaysPush, Observable} from "../src/utils/event.observer";
import {DataEvent} from "../src/types/workflow.type";
import {EventTypes} from "../src/utils/status.enum";
import {filterLogsByType} from "./mocks/utils.mocks";
// TODO: add error and end conditions;
describe('Signal should...', () => {

    let observer: Observable<DataEvent>;
    let logs: DataEvent[];
    beforeEach(() => {
        logs = [];
        observer = new Observable<DataEvent>();
        observer.subscribe(AndAlwaysPush, log => {
            logs.push(log);
        })
    })
    //1. Push a `Signal` event after being started
    test('Push a `Signal` event after being started', done => {

        const data = mockSignal_Simple();
        const signalInstance = new Signal(data.signal, observer);
        observer.subscribe('Signal', () => {
            done();
        })
        signalInstance.start();
    })
    // 2. End when a signal with the awaited Signal State is pushed
    test('End when a signal with the awaited Signal State is pushed', done => {

        const data = mockSignal_Simple();
        const signalInstance = new Signal(data.signal, observer);

        observer.subscribe(`Element:${signalInstance.Data.Id}:${EventTypes.End}`, () => {
            try {
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBe(0);
                done()
            } catch(e){
                done(e);
            }
        })
        signalInstance.start();
        // we wait for 100ms
        setTimeout(() => {

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            observer.push(signalInstance.Data.State.Data as string, data.event);
            // we push the event
        },100);
    })
    //
    // ===========================
    // When implementing types of signals
    // ===========================
    // 3. Push a `CommandSignal` event after being started with this type
    // 4. Push a `WorkflowSignal` event after being started with this type
})
