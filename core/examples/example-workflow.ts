/**
 * @description This is an example of a workflow object
 * @description Resources to make starter types out of this object
 * @package https://www.npmjs.com/package/maketypes
 * @package https://github.com/jvilk/MakeTypes
 * @package https://jvilk.com/MakeTypes/
 *
 */

enum WF {
    ScriptExecution = "ScriptExecution",
    ConditionList = "ConditionList",
    ExecutionSignal = "ExecutionSignal",
    CommandSignal = "CommandSignal",
    ApiCall = "ApiCall"
}

interface ElementState {
    Data: unknown,
    readonly Type: WF
}

class State implements ElementState {
    private _Data: string;
    readonly _Type: WF

    constructor(data: string, type: WF) {
        this._Data = data;
        this._Type = type
    }

    set Data(value: unknown) {
        this._Data = JSON.stringify(value);
    }

    get Data() {
        return this._Data;
    }

    get Type(): WF {
        return this._Type;
    }


}

const wf = {

    workflow: {
        Id: "1000",
        Description: "Description",
        IsActive: true,
        IsPublic: true, // true = can be started by anyone | false = can only be started by an Execution Signal
        WorkFlowStatusId: "3",
        WorkFlowStartElementId: "100",
    },
    elements: [
        // Task - Script
        {
            Id: "string::uuid",
            Name: "name-100",
            Description: "Description 100",
            WorkFlowId: "string:uuid",
            ElementType: "Task", // Task | Gate | Signal | Workflow
            StatusId: "1",
            NextElementId: "101",
            State: {
                Type: WF.ScriptExecution,
                Data: "C:\\\\Users\\\\adamo\\\\projects\\\\rootsby\\\\src\\\\tests\\\\task_scripts\\\\task_script\\"
            }
        },
        // Task - Api Call
        {
            Id: "string::uuid",
            Name: "name-100",
            Description: "Description 100",
            WorkFlowId: "string:uuid",
            ElementType: "Task", // Task | Gate | Signal | Workflow
            StatusId: "1",
            NextElementId: "101",
            State: {
                Type: WF.ApiCall,
                Data: "{\"url\":\"https://catfact.ninja/fact\",\"method\":\"GET\"}" // axios config
            }
        },
        // Gate
        {
            Id: "string::uuid",
            Name: "name-101",
            Description: "Description 101",
            WorkFlowId: "1000",
            ElementType: "Gate", // Task | Gate | Signal | Workflow
            StatusId: "1",
            NextElementId: null,
            State: {
                Type: WF.ConditionList,
                Data: `[
                    {
                        Operation: "eq",
                        State: "go-to-103",
                        ElementType: "Condition",
                        NextElementId: "string:uuid"
                    },
                    {
                        Operation: "eq",
                        State: "go-to-105",
                        ElementType: "Condition",
                        NextElementId: "string:uuid"
                    }
                ]`
            }
        },
        // Signal - Workflow exec
        // Resume current workflow when the executed one is done
        {
            Id: "string::uuid",
            Name: "name-101",
            Description: "Description 101",
            WorkFlowId: "1000",
            ElementType: "Signal", // Task | Gate | Signal | Workflow
            StatusId: "1",
            NextElementId: null,
            State: {
                Type: WF.ExecutionSignal,
                Data: "string:uuid" // string:uuid representing id of the workflow to be started
            }
        },
        // Signal - await for [...]
        // Resume workflow when signal command is received
        {
            Id: "string::uuid",
            Name: "name-101",
            Description: "Description 101",
            WorkFlowId: "1000",
            ElementType: "Signal", // Task | Gate | Signal | Workflow
            StatusId: "1",
            NextElementId: null,
            State: {
                Type: WF.CommandSignal,
                Data: "string" // string representing the command to be inputted from the client
            }
        }
    ]
}
