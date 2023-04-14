import {DataEvent, DataFlowElement, WorkflowEvent} from "./types/workflow.type";
import {EventName, EventTypes} from './utils/status.enum';
import {Observable} from './utils/event.observer';

export class FlowBaseElement {

    data: DataFlowElement;
    events: Observable<DataEvent>;
    hasError = false;

    constructor(element: DataFlowElement, observerInstance: Observable<DataEvent>) {
        this.events = observerInstance;
        this.data = element;
    }

    createEvent(eventName: EventName, message?: string) {
        return new WorkflowEvent(eventName, {
            id: this.data.id,
            elementType: this.data.elementType,
            nextElementId: this.data.nextElementId,
            output: message ? message : null
        })
    }

    start(data?: DataEvent): void {
        if(this.hasError){
            this.error();
            this.end();
            return;
        }
        const ev = this.createEvent(EventTypes.Start)
        this.events.push(`TEST:LOG`, {...ev, data: {...ev.data, output: `Start:Element:${this.data.id}`}});
        this.events.push(`Element:${this.data.id}:${EventTypes.Start}`, data ? data : ev);
        this.progress();
    }

    end(data?: DataEvent): void {
        const ev = this.createEvent(EventTypes.End);
        this.events.push(`TEST:LOG`, {...ev, data: {...ev.data, output: `End:Element:${this.data.id}`}});
        this.events.push(`Element:${this.data.id}:${EventTypes.End}`, data ? data : ev);
    }

    error(): void {
        // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Error)
        this.events.push(`Element:${this.data.id}:${EventTypes.Error}`, ev);
        this.events.push(`TEST:LOG`, {...ev, data: {...ev.data, output: `Element:Error:${this.data.id}`}});
    }

    progress(): void {
        // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Progress)
        this.events.push(`Element:${this.data.id}:${EventTypes.Progress}`, ev);
        this.events.push(`TEST:LOG`, {...ev, data:{...ev.data, output: `Progress:Element:${this.data.id}`}});

    }
}
