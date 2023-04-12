/**
 * Convention:
 *  - DataFlow = refers to interface data types.
 *  - WorkFlow = refers to classes that implement DataFlow types and interfaces.
 *
 */

import {EventName} from '../utils/status.enum';
import {Operator, PrimitiveExpression} from "../utils/expression.parser";

export interface DataFlowElementType {
    Id: string;
    Name: string;
    Description: string;
}

export interface DataFlowStatus {
    Id: string;
    Name: string;
}

export interface DataFlow {
    Id: string;
    Description: string;
    IsActive: boolean;
    IsPublic: boolean;
    WorkFlowStatus: DataFlowStatus['Id'];
    WorkFlowStartElementId: DataFlowElement['Id'];
}

export interface DataFlowBaseElement {
    Id: string; // *
    Name: string;
    Description: string;
    State: { Type: string, Data: string } | null;
    ElementType: DataFlowElementType['Id'];
    StatusId: DataFlowStatus['Id'];
    NextElementId: DataFlowBaseElement['Id'] | null;
}

export interface DataFlowElement extends DataFlowBaseElement {
    WorkFlowId: DataFlow['Id'];
}

export interface DataFlowConfiguration {
    workflow: DataFlow;
    elements: DataFlowElement[];
}
export interface DataEvent {
    Type: EventName,
    Data: WorkflowEventData
}

export interface GateCondition {
    Operator: Operator,
    State: PrimitiveExpression,
    ElementType: string,
    NextElementId: string
}

export interface WorkflowEventData {
    Id: string,
    Output: string | null,
    ElementType: string,
    NextElementId: string | null
}

export class WorkflowEvent implements DataEvent {
    Type: EventName;
    Data: WorkflowEventData

    constructor(type: EventName, data: WorkflowEventData) {
        this.Type = type;
        this.Data = data;
    }
}

