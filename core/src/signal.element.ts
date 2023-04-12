import {DataEvent, DataFlowElement} from "./types/workflow.type";
import {FlowBaseElement} from "./base.element";
import {EventTypes} from './utils/status.enum';
import {Observable} from './utils/event.observer';


export class Signal extends FlowBaseElement {
    constructor(element: DataFlowElement, observerInstance: Observable<DataEvent>) {
        super(element, observerInstance);
    }

    progress(): void {
        const ev = this.createEvent(EventTypes.Progress)
        ev.Data.Output = JSON.stringify(this.Data.State);
        this.events.push(`Element:${this.Data.Id}:${EventTypes.Progress}`, ev);
        this.events.push('Signal',ev)
        this.events.push(`TEST:LOG`,{...ev, Data:{...ev.Data, Output: `Progress:Element:${this.Data.Id}`}});
        this.events.subscribe(this.Data.State?.Data as string,()=>{
            this.end();
        })
        // this.End();
    }
}
