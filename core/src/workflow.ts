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
type NextElementId = DataFlowElement['NextElementId'];

export class WorkFlow {

    public currentElementId: DataFlowElement['Id'];
    private elements: { [id: DataFlowElement['Id']]: WorkflowElement } = {};
    public Data: DataFlow;
    private readonly events: Observable<DataEvent> = new Observable<DataEvent>();

    constructor(data: DataFlowConfiguration) {

        this.Data = data.workflow;
        this.currentElementId = this.Data.WorkFlowStartElementId;
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
            this.elements[item.Id] = this.createElement(item);
        });
    }

    private get currentElement(): WorkflowElement {
        return this.elements[this.currentElementId];
    }

    private whenElementEnds(): void {
        this.currentElement.events.subscribe(`Element:${EventTypes.Error}:${this.currentElement.Data.Id}`, () => {
            // TODO: still need to add tests for this
            this.currentElement.events.unsubscribeAll(`Element:${EventTypes.Error}:${this.currentElement.Data.Id}`);
            this.error();
            this.end();
        })
        this.currentElement.events.subscribe(`Element:${this.currentElement.Data.Id}:${EventTypes.End}`, (event: DataEvent) => {

            this.currentElement.events.unsubscribeAll(`Element:${this.currentElement.Data.Id}:${EventTypes.End}`);
            let nextElementId: NextElementId = this.currentElement.Data.NextElementId;

            // NOTE: when used here this happens after the gateway execution
            if (isGateway(this.currentElement.Data.ElementType as ElementTypes) && event.Data.Output) {
                // NOTE: this works only works for one computed condition
                // TODO: address multi condition .Output
                const conditions = JSON.parse(event.Data.Output) as GateCondition[]
                nextElementId = conditions[0].NextElementId;
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

        const elementTypeId = listItem.ElementType as ElementTypes;
        if (isTask(elementTypeId) && listItem.State) {
            return new Task(listItem, this.events);
        }
        if (isEvent(elementTypeId)) {
            return new Signal(listItem, this.events);
        }
        if (isGateway(elementTypeId) && listItem.State) {
            return new Gate(listItem, this.events);
        }
        throw new Error('ElementType is not set');
        // TODO: throw an error for element misconfiguration;
    }

    private createEvent(eventName: EventName, message?: string) {
        return new WorkflowEvent(eventName, {
            Id: this.Data.Id,
            Output: message ? message : null,
            NextElementId: null,
            ElementType: ElementTypes.Workflow
        })
    }

    error(): void { // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Error)
        this.events.push(`Workflow:${EventTypes.Error}:${this.Data.Id}`, ev);
    }

    start(): void {
        const ev = this.createEvent(EventTypes.Start)
        this.events.push('TEST:LOG', ev);
        this.events.push(`Workflow:${this.Data.Id}:${EventTypes.Start}`, ev);
        this.currentElementId = this.Data.WorkFlowStartElementId;
        this.Data.WorkFlowStatus = StateStatus.Running;

        this.progress(true);
    }

    progress(firstRun = false): void {
        const ev = this.createEvent(EventTypes.Progress);
        this.events.push('TEST:LOG', {...ev, Data: {...ev.Data, Output: `Progress:Workflow:${this.Data.Id}`}});
        this.events.push(`Workflow:${this.Data.Id}:${EventTypes.Progress}`, ev);

        this.whenElementEnds();

        if (firstRun) {
            const startEvent = this.currentElement.createEvent(EventTypes.Start);
            this.currentElement.start(startEvent);
        }
    }

    end(): void {
        if (this.Data.WorkFlowStatus === StateStatus.Success) {
            // TODO: still need to add tests for this block
            return;
        }
        const ev = this.createEvent(EventTypes.End)
        this.events.push('TEST:LOG', {...ev, Data: {...ev.Data, Output: `End:Workflow:${this.Data.Id}`}});

        this.Data.WorkFlowStatus = StateStatus.Success;
        this.events.push(`Workflow:${this.Data.Id}:${EventTypes.End}`, ev);
    }

    onLog(callback: (data: DataEvent) => void): void {
        this.events.subscribe('TEST:LOG', callback);
    }

    on(eventName: EventName, callback: (data: DataEvent) => void): void {
        this.events.subscribe(`Workflow:${this.Data.Id}:${eventName}`, data => {
            if (callback) {
                callback(data);
            }
            this.events.unsubscribeAll(`Workflow:${this.Data.Id}:${eventName}`);
        });
    }

    public onSignal(callback: (data: DataEvent) => void): void {
        if (callback) {
            this.events.subscribe('Signal', data => {
                this.Data.WorkFlowStatus = StateStatus.Idle;
                callback(data)
            })
        }
    }

    public sendSignal(signalData: string): void {
        if (this.currentElement.Data.ElementType === 'Signal' &&
            this.currentElement.Data.State?.Data === signalData) {
            const ev = this.currentElement.createEvent(EventTypes.Progress);
            ev.Data.Output = 'Send signal was called';
            this.events.push('TEST:LOG', ev);
            this.events.push(signalData, ev);
        }
    }
}
