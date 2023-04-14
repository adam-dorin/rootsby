/**
 * Convention:
 *  - DataFlow = refers to interface data types.
 *  - WorkFlow = refers to classes that implement DataFlow types and interfaces.
 *
 */

import {EventName} from '../utils/status.enum';
import {Operator, PrimitiveExpression} from "../utils/expression.parser";

export interface DataFlowElementType {
    id: string;
    name: string;
    description: string;
}

export interface DataFlowStatus {
    id: string;
    name: string;
}

export interface DataFlow {
    id: string;
    description: string;
    isActive: boolean;
    isPublic: boolean;
    workFlowStatus: DataFlowStatus['id'];
    workFlowStartElementId: DataFlowElement['id'];
}

export interface DataFlowBaseElement {
    id: string; // *
    name: string;
    description: string;
    state: { type: string, data: string } | null;
    elementType: DataFlowElementType['id'];
    statusId: DataFlowStatus['id'];
    nextElementId: DataFlowBaseElement['id'] | null;
}

export interface DataFlowElement extends DataFlowBaseElement {
    workFlowId: DataFlow['id'];
}

export interface DataFlowConfiguration {
    workflow: DataFlow;
    elements: DataFlowElement[];
}
export interface DataEvent {
    type: EventName,
    data: WorkflowEventData
}

export interface GateCondition {
    operator: Operator,
    state: PrimitiveExpression,
    elementType: string,
    nextElementId: string
}

export interface WorkflowEventData {
    id: string,
    output: string | null,
    elementType: string,
    nextElementId: string | null
}

export class WorkflowEvent implements DataEvent {
    type: EventName;
    data: WorkflowEventData

    constructor(type: EventName, data: WorkflowEventData) {
        this.type = type;
        this.data = data;
    }
}

