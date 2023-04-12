import {DataEvent, DataFlowElement, WorkflowEvent} from "./types/workflow.type";
import {EventName, EventTypes} from './utils/status.enum';
import {Observable} from './utils/event.observer';

export class FlowBaseElement {

    Data: DataFlowElement;
    events: Observable<DataEvent>;
    hasError = false;

    constructor(element: DataFlowElement, observerInstance: Observable<DataEvent>) {
        this.events = observerInstance;
        this.Data = element;
    }

    createEvent(eventName: EventName, message?: string) {
        return new WorkflowEvent(eventName, {
            Id: this.Data.Id,
            ElementType: this.Data.ElementType,
            NextElementId: this.Data.NextElementId,
            Output: message ? message : null
        })
    }

    start(data?: DataEvent): void {
        if(this.hasError){
            this.error();
            this.end();
            return;
        }
        const ev = this.createEvent(EventTypes.Start)
        this.events.push(`TEST:LOG`, {...ev, Data: {...ev.Data, Output: `Start:Element:${this.Data.Id}`}});
        this.events.push(`Element:${this.Data.Id}:${EventTypes.Start}`, data ? data : ev);
        this.progress();
    }

    end(data?: DataEvent): void {
        const ev = this.createEvent(EventTypes.End);
        this.events.push(`TEST:LOG`, {...ev, Data: {...ev.Data, Output: `End:Element:${this.Data.Id}`}});
        this.events.push(`Element:${this.Data.Id}:${EventTypes.End}`, data ? data : ev);
    }

    error(): void {
        // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Error)
        this.events.push(`Element:${this.Data.Id}:${EventTypes.Error}`, ev);
        this.events.push(`TEST:LOG`, {...ev, Data: {...ev.Data, Output: `Element:Error:${this.Data.Id}`}});
    }

    progress(): void {
        // TODO: still need to add tests for this
        const ev = this.createEvent(EventTypes.Progress)
        this.events.push(`Element:${this.Data.Id}:${EventTypes.Progress}`, ev);
        this.events.push(`TEST:LOG`, {...ev, Data:{...ev.Data, Output: `Progress:Element:${this.Data.Id}`}});

    }
}
