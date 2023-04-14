/**
 * Convention:
 *  - DataFlow = refers to interface data types.
 *  - WorkFlow = refers to classes that implement DataFlow types and interfaces.
 *
 */
import {
    DataEvent,
    DataFlow,
    DataFlowConfiguration,
    DataFlowElement,
    GateCondition,
    WorkflowEvent
} from './types/workflow.type';
import {Signal} from './signal.element';
import {Gate} from './gate.element';
import {Task} from './task.element';
import {Observable} from './utils/event.observer';
import {
    ElementTypes,
    EventName,
    EventTypes,
    isEvent,
    isGateway,
    isTask,
    StateStatus
} from './utils/status.enum';

type WorkflowElement = Task | Signal | Gate;
type NextElementId = DataFlowElement['nextElementId'];

export class WorkFlow {

    public currentElementId: DataFlowElement['id'];
    private elements: { [id: DataFlowElement['id']]: WorkflowElement } = {};
    public data: DataFlow;
    private readonly events: Observable<DataEvent> = new Observable<DataEvent>();

    constructor(data: DataFlowConfiguration) {

        this.data = data.workflow;
        this.currentElementId = this.data.workFlowStartElementId;
        this.createElementsRecord(data.elements);
        this.checkConnections(data.elements);
    }

    private checkConnections(elements: DataFlowElement[]) {

        if (elements) {
            // TODO: enforce connection rules based on element type
        }
    }

    private createElementsRecord(elements: DataFlowElement[]): void {
        elements.forEach(item => {
            this.elements[item.id] = this.createElement(item);
        });
    }

    private get currentElement(): WorkflowElement {
        return this.elements[this.currentElementId];
    }

    private whenElementEnds(): void {
        this.currentElement.events.subscribe(`Element:${EventTypes.Error}:${this.currentElement.data.id}`, () => {
            // TODO: still need to add tests for this
            this.currentElement.events.unsubscribeAll(`Element:${EventTypes.Error}:${this.currentElement.data.id}`);
            this.error();
            this.end();
        })
        this.currentElement.events.subscribe(`Element:${this.currentElement.data.id}:${EventTypes.End}`, (event: DataEvent) => {

            this.currentElement.events.unsubscribeAll(`Element:${this.currentElement.data.id}:${EventTypes.End}`);
            let nextElementId: NextElementId = this.currentElement.data.nextElementId;

            // NOTE: when used here this happens after the gateway execution
            if (isGateway(this.currentElement.data.elementType as ElementTypes) && event.data.output) {
                // NOTE: this works only works for one computed condition
                // TODO: address multi condition .Output
                const conditions = JSON.parse(event.data.output) as GateCondition[]
                nextElementId = conditions[0].nextElementId;
            }

            if (!nextElementId) {
                this.end();
            }

            if (nextElementId) {
                this.currentElementId = nextElementId;
                this.progress();
                this.currentElement.start(event);
            }
        });
    }

    private createElement(listItem: DataFlowElement): WorkflowElement {

        const elementTypeId = listItem.elementType as ElementTypes;
        if (isTask(elementTypeId) && listItem.state) {
            return new Task(listItem, this.events);
        }
        if (isEvent(elementTypeId)) {
            return new Signal(listItem, this.events);
        }
        if (isGateway(elementTypeId) && listItem.state) {
            return new Gate(listItem, this.events);
        }
        throw new Error('ElementType is not set');
        // TODO: throw an error for element misconfiguration;
    }

    private createEvent(eventName: EventName, message?: string) {
        return new WorkflowEvent(eventName, {
            id: this.data.id,
            output: message ? message : null,
            nextElementId: null,
            elementType: ElementTypes.Workflow
        })
    }

    error(): void { // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Error)
        this.events.push(`Workflow:${EventTypes.Error}:${this.data.id}`, ev);
    }

    start(): void {
        const ev = this.createEvent(EventTypes.Start)
        this.events.push('TEST:LOG', ev);
        this.events.push(`Workflow:${this.data.id}:${EventTypes.Start}`, ev);
        this.currentElementId = this.data.workFlowStartElementId;
        this.data.workFlowStatus = StateStatus.Running;

        this.progress(true);
    }

    progress(firstRun = false): void {
        const ev = this.createEvent(EventTypes.Progress);
        this.events.push('TEST:LOG', {...ev, data: {...ev.data, output: `Progress:Workflow:${this.data.id}`}});
        this.events.push(`Workflow:${this.data.id}:${EventTypes.Progress}`, ev);

        this.whenElementEnds();

        if (firstRun) {
            const startEvent = this.currentElement.createEvent(EventTypes.Start);
            this.currentElement.start(startEvent);
        }
    }

    end(): void {
        if (this.data.workFlowStatus === StateStatus.Success) {
            // TODO: still need to add tests for this block
            return;
        }
        const ev = this.createEvent(EventTypes.End)
        this.events.push('TEST:LOG', {...ev, data: {...ev.data, output: `End:Workflow:${this.data.id}`}});

        this.data.workFlowStatus = StateStatus.Success;
        this.events.push(`Workflow:${this.data.id}:${EventTypes.End}`, ev);
    }

    onLog(callback: (data: DataEvent) => void): void {
        this.events.subscribe('TEST:LOG', callback);
    }

    on(eventName: EventName, callback: (data: DataEvent) => void): void {
        this.events.subscribe(`Workflow:${this.data.id}:${eventName}`, data => {
            if (callback) {
                callback(data);
            }
            this.events.unsubscribeAll(`Workflow:${this.data.id}:${eventName}`);
        });
    }

    public onSignal(callback: (data: DataEvent) => void): void {
        if (callback) {
            this.events.subscribe('Signal', data => {
                this.data.workFlowStatus = StateStatus.Idle;
                callback(data)
            })
        }
    }

    public sendSignal(signalData: string): void {
        if (this.currentElement.data.elementType === 'Signal' &&
            this.currentElement.data.state?.data === signalData) {
            const ev = this.currentElement.createEvent(EventTypes.Progress);
            ev.data.output = 'Send signal was called';
            this.events.push('TEST:LOG', ev);
            this.events.push(signalData, ev);
        }
    }
}
