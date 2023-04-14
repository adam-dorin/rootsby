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
            if(!element.state){
                this.hasError = true;
                return;
            }
            this.parsedState = JSON.parse(element.state.data) as GateCondition[];
        } catch (e) {
            this.hasError = true;
        }
    }

    start(event: DataEvent): void {
        const ev = this.createEvent(EventTypes.Start);
        this.events.push(`TEST:LOG`, {...ev, data: {...ev.data, output: `Start:Element:Gate:${this.data.id}`}});
        this.progress(event.data.output === null ? undefined : event.data.output);
    }

    end(event?: DataEvent): void {
        const _event = this.createEvent(EventTypes.End);
        this.events.push(`Element:${this.data.id}:${EventTypes.End}`, event ? event : _event);
    }

    progress(input?: PrimitiveExpression | null): void {

        const endEvent = this.createEvent(EventTypes.End);
        if (input === undefined || input === null || this.hasError) {
            this.error();
            return this.end(endEvent);
        }
        const ev = this.createEvent(EventTypes.Progress);
        this.events.push(`Element:${EventTypes.Progress}:${this.data.id}`, ev);
        const ev_log = {...ev, data: {...ev.data, output: `Progress:Element:${this.data.id}`}};
        this.events.push(`TEST:LOG`, ev_log);
        try {
            const filteredConditions = this.parsedState.filter((condition: GateCondition) => {
                return ExpressionParser.run(input as PrimitiveExpression, condition.state, condition.operator)
            });
            if (filteredConditions.length) {
                endEvent.data.output = JSON.stringify(filteredConditions);
                return this.end(endEvent)
            } else {
                this.error()
                return this.end(endEvent);
            }
        } catch (e) {
            endEvent.data.output = (e as any)?.message;
            this.end(endEvent);
            return this.end(endEvent)
        }
    }
}
