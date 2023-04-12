import {DataEvent, DataFlowElement, GateCondition} from "./types/workflow.type";
import {FlowBaseElement} from "./base.element";
import {Observable} from './utils/event.observer';
import {EventTypes} from './utils/status.enum';
import {ExpressionParser, PrimitiveExpression} from "./utils/expression.parser";


export class Gate extends FlowBaseElement {

    parsedState!: GateCondition[] // these are the actual conditions

    constructor(element: DataFlowElement, observerInstance: Observable<DataEvent>) {
        super(element, observerInstance);
        try {
            if(!element.State){
                this.hasError = true;
                return;
            }
            this.parsedState = JSON.parse(element.State.Data) as GateCondition[];
        } catch (e) {
            this.hasError = true;
        }
    }

    start(event: DataEvent): void {
        const ev = this.createEvent(EventTypes.Start);
        this.events.push(`TEST:LOG`, {...ev, Data: {...ev.Data, Output: `Start:Element:Gate:${this.Data.Id}`}});
        this.progress(event.Data.Output === null ? undefined : event.Data.Output);
    }

    end(event?: DataEvent): void {
        const _event = this.createEvent(EventTypes.End);
        this.events.push(`Element:${this.Data.Id}:${EventTypes.End}`, event ? event : _event);
    }

    progress(input?: PrimitiveExpression | null): void {

        const endEvent = this.createEvent(EventTypes.End);
        if (input === undefined || input === null || this.hasError) {
            this.error();
            return this.end(endEvent);
        }
        const ev = this.createEvent(EventTypes.Progress);
        this.events.push(`Element:${EventTypes.Progress}:${this.Data.Id}`, ev);
        const ev_log = {...ev, Data: {...ev.Data, Output: `Progress:Element:${this.Data.Id}`}};
        this.events.push(`TEST:LOG`, ev_log);
        try {
            const filteredConditions = this.parsedState.filter((condition: GateCondition) => {
                return ExpressionParser.run(input as PrimitiveExpression, condition.State, condition.Operator)
            });
            if (filteredConditions.length) {
                endEvent.Data.Output = JSON.stringify(filteredConditions);
                return this.end(endEvent)
            } else {
                this.error()
                return this.end(endEvent);
            }
        } catch (e) {
            endEvent.Data.Output = (e as any)?.message;
            this.end(endEvent);
            return this.end(endEvent)
        }
    }
}
