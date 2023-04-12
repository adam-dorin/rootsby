export enum StateStatus {
    Idle = '1',
    Running = '2',
    Success = '3',
    Error = '4'
}


export enum ElementTypes {
    Task = 'Task',
    Signal = 'Signal',
    Gate = 'Gate',
    Workflow = 'Workflow',
    EventEnd = '13',
}

export enum ShortElementTypes {
    Event = 'Signal',
    Gateway = 'Gate',
    Task = 'Task',
    Unknown = '999'
}

export enum EventTypes {
    Start = 'Start',
    End = 'End',
    Progress = 'Progress',
    Error = 'Error'
}

export type EventName = EventTypes.Start | EventTypes.Progress | EventTypes.End | EventTypes.Error;

export const isTask = (type: ElementTypes): boolean => [ElementTypes.Task].includes(type);

export const isEvent = (type: ElementTypes): boolean => {
    return [
        ElementTypes.Signal,
        ElementTypes.EventEnd
    ].includes(type);
};

export const isGateway = (type: ElementTypes): boolean => {
    return [
     ElementTypes.Gate
    ].includes(type);
};

export const getElementType = (type: ElementTypes): ShortElementTypes => { // TODO: still need to add tests for this

    if (isEvent(type)) {
        return ShortElementTypes.Event;
    }
    if (isTask(type)) {
        return ShortElementTypes.Task;
    }
    if (isGateway(type)) {
        return ShortElementTypes.Gateway;
    }

    return ShortElementTypes.Unknown;
};
