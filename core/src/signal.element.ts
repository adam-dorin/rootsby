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
        ev.data.output = JSON.stringify(this.data.state);
        this.events.push(`Element:${this.data.id}:${EventTypes.Progress}`, ev);
        this.events.push('Signal',ev)
        this.events.push(`TEST:LOG`,{...ev, data:{...ev.data, output: `Progress:Element:${this.data.id}`}});
        this.events.subscribe(this.data.state?.data as string,()=>{
            this.end();
        })
        // this.End();
    }
}
