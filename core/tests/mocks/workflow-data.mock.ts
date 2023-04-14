import {DataFlowConfiguration, DataFlowElement, WorkflowEvent,} from "../../src/types/workflow.type";

import * as uuid from 'uuid';
import {ElementTypes, EventTypes} from "../../src/utils/status.enum";
import * as path from "path";

//===============================================================================================================//
//==============================================================================================================//

enum WF {
    ScriptExecution = "ScriptExecution",
    ConditionList = "ConditionList",
    ExecutionSignal = "ExecutionSignal",
    CommandSignal = "CommandSignal",
    ApiCall = "ApiCall"
}


export const workflow_mocks: any = {};

workflow_mocks.mockWorkflow = (id: string, elements: any[], startId: string) => {
    return {
        workflow: {
            id: id,
            description: "Description",
            isActive: true,
            isPublic: true, // true = can be started by anyone | false = can only be started by an Execution Signal
            workFlowStatus: "3",
            workFlowStartElementId: startId,
        },
        elements: [...elements]
    } as DataFlowConfiguration
}
workflow_mocks.makeTaskElement = (elementType: string, workflowId: string, nextElementId: string | null) => {
    const el: any = {
        id: uuid.v4(),
        name: "name-100",
        description: "Description 100",
        state: null,
        workFlowId: workflowId,
        elementType: "Task", // Task | Gate | Signal | Workflow
        statusId: "1",
        nextElementId: nextElementId
    } as DataFlowElement

    if (elementType === WF.ScriptExecution) {
        el['state'] = {
            type: WF.ScriptExecution,
            // The path here should be `workflowBasePath`+`localPath`+`fileName`
            data: JSON.stringify(path.resolve(process.cwd()+'/tests/mocks/task_scripts/task_script'))
        }
    }
    if (elementType === WF.ApiCall) {
        el['state'] = {
            type: WF.ApiCall,
            data: "{\"url\":\"https://catfact.ninja/fact\",\"method\":\"GET\"}" // axios config
        }
    }

    return el;
}
workflow_mocks.makeConditionState = (op: string, state: string, id: string) => {
    return {
        operator: op,
        state: state,
        elementType: "Condition",
        nextElementId: id
    }
}
workflow_mocks.makeGateElement = (workflowId: string, actions: any[]) => {
    const el: any = {
        id: uuid.v4(),
        name: "name-101",
        description: "Description 101",
        state: {
            type: WF.ConditionList,
            data: JSON.stringify(actions)
            //[
            //workflow_mocks.makeConditionState('eq', 'go-to-103', 'string:uuid'),
            //workflow_mocks.makeConditionState('eq', 'go-to-105', 'string:uuid')
            //]
        },
        workFlowId: workflowId,
        elementType: "Gate", // Task | Gate | Signal | Workflow
        statusId: "1",
        nextElementId: null,

    }
    return el;
}
workflow_mocks.makeSignalElement = (workflowId: string, nextElementId: string, state: { type: WF, data: string }) => {
    const el: any = {
        id: uuid.v4(),
        name: "name-101",
        description: "Description 101",
        workFlowId: workflowId,
        elementType: "Signal", // Task | Gate | Signal | Workflow
        statusId: "1",
        nextElementId: nextElementId,
        state: state
    }
    return el;
}

export const mockWorkflowData_TaskOnly_SE = () => {
    const wfId = uuid.v4();
    const elements = [
        workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, null)
    ]
    return workflow_mocks.mockWorkflow(wfId, elements, elements[0].id)
}

export const mockWorkflowData_TaskOnly_API = () => {
    const wfId = uuid.v4();
    const elements = [
        workflow_mocks.makeTaskElement(WF.ApiCall, wfId, null)
    ]
    return workflow_mocks.mockWorkflow(wfId, elements, elements[0].id)
}

export const mockWorkflowData_Gate_Simple = () => {
    const wfId = uuid.v4();
    const elTrue = workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, null);
    const elFalse = workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, null);
    const gate = workflow_mocks.makeGateElement(wfId, [
        workflow_mocks.makeConditionState('eq', 'THIS_IS_THE_RESULT', elTrue.id),
        workflow_mocks.makeConditionState('eq', 'SOME_OTHER_STUFF', elFalse.id)
    ])

    const elements = [
        workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, gate.id),
        gate,
        elFalse,
        elTrue
    ]
    return workflow_mocks.mockWorkflow(wfId, elements, elements[0].id);
}


export const mockWorkflowData_Signal_Simple = () => {
    const wfId = uuid.v4();
    const postEl = workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, null);
    const state = {type: WF.CommandSignal, data: 'THIS_IS_THE_SIGNAL'};
    const signal = workflow_mocks.makeSignalElement(wfId, postEl.id, state)
    const elements = [
        workflow_mocks.makeTaskElement(WF.ScriptExecution, wfId, signal.id),
        signal,
        postEl
    ]
    return workflow_mocks.mockWorkflow(wfId, elements, elements[0].id)
}

export const mockTaskData_Task_Script_Execution = () => {
    return workflow_mocks.makeTaskElement(WF.ScriptExecution, uuid.v4(), null)
}

export const mockTaskData_Task_Script_Execution_Error = () => {
    const taskData = workflow_mocks.makeTaskElement(WF.ScriptExecution, uuid.v4(), null)
    taskData.state.data = JSON.stringify(path.resolve(process.cwd()+'/tests/mocks/task_scripts/task_script_error'));
    return taskData
}

export const mockTaskData_Task_Api_Call = () => {
    return workflow_mocks.makeTaskElement(WF.ApiCall, uuid.v4(), null)
}

export const mockGateData = () => {
    const elTrue = uuid.v4()
    const elFalse = uuid.v4()
    const gate = workflow_mocks.makeGateElement(uuid.v4(), [
        workflow_mocks.makeConditionState('eq', 'THIS_IS_THE_RESULT', elTrue),
        workflow_mocks.makeConditionState('eq', 'SOME_OTHER_STUFF', elFalse)
    ])
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Gate,
        nextElementId: null,
        output: 'THIS_IS_THE_RESULT'
    })
    return {elFalse, elTrue, gate, event};
}
export const mockNullGateData = () => {
    const elTrue = uuid.v4()
    const elFalse = uuid.v4()
    const gate = workflow_mocks.makeGateElement(uuid.v4(), [
        workflow_mocks.makeConditionState('eq', 'THIS_IS_THE_RESULT', elTrue),
        workflow_mocks.makeConditionState('eq', 'SOME_OTHER_STUFF', elFalse)
    ])
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Gate,
        nextElementId: null,
        output: null
    })
    return {gate, event};
}
export const mockInvalidGateData = () => {
    const elTrue = uuid.v4()
    const elFalse = uuid.v4()
    const gate = workflow_mocks.makeGateElement(uuid.v4(), [
        workflow_mocks.makeConditionState('eq', 'THIS_IS_THE_RESULT', elTrue),
        workflow_mocks.makeConditionState('eq', 'SOME_OTHER_STUFF', elFalse)
    ])
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Gate,
        nextElementId: null,
        output: `_____THIS_IS_NOT_THE_RESULT__________`
    })
    return {gate, event};
}
export const mockInvalidStateGateData = () => {
    const elTrue = uuid.v4()
    const elFalse = uuid.v4()
    const gate = workflow_mocks.makeGateElement(uuid.v4(), [
        workflow_mocks.makeConditionState('eq', 'THIS_IS_THE_RESULT', elTrue),
        workflow_mocks.makeConditionState('eq', 'SOME_OTHER_STUFF', elFalse)
    ])
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Gate,
        nextElementId: null,
        output: `THIS_IS_THE_RESULT`
    })

    gate.state = null;

    return {gate, event};
}
export const mockInvalidConditionsGateData = () => {
    const elTrue = uuid.v4()
    const elFalse = uuid.v4()
    const gate = workflow_mocks.makeGateElement(uuid.v4(), [
        // This operators are invalid (first arg)
        workflow_mocks.makeConditionState('eqaa', 'THIS_IS_THE_RESULT', elTrue),
        workflow_mocks.makeConditionState('eqaa', 'SOME_OTHER_STUFF', elFalse)
    ])
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Gate,
        nextElementId: null,
        output: `THIS_IS_THE_RESULT`
    })

    gate.state = null;

    return {gate, event};
}

export const mockSignal_Simple = () => {
    const wfId = uuid.v4();

    const state = {type: WF.CommandSignal, data: 'THIS_IS_THE_SIGNAL'};
    const signal = workflow_mocks.makeSignalElement(wfId, uuid.v4(), state)
    const event = new WorkflowEvent(EventTypes.Start, {
        id: uuid.v4(),
        elementType: ElementTypes.Signal,
        nextElementId: null,
        output: null
    })
    return {signal, event};
}
