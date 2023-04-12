import {DataEvent} from "../../src/types/workflow.type";
import fs from "fs";
import {EventTypes} from "../../src/utils/status.enum";

export const filterLogsOutput = (logs: DataEvent[] = [], what: string) => {
    return logs.filter((e: DataEvent) => e.Data.Output && e.Data.Output.toString().includes(what))
}
export const filterLogsByType = (logs: DataEvent[] = [], what: EventTypes) => {
    return logs.filter((e: DataEvent) => e.Type === what)
}
export const makeAFile = (name: string, obj: any, callback?: () => void) => {
    fs.writeFile(`./examples/${name}.json`,
        JSON.stringify(obj, null, 2), () => {
            callback ? callback() : null;
        })
}
export const writeJsonLogs = (obj: any, callback?: () => void) => {
    fs.writeFile('./tests/exec-log.json',
        JSON.stringify(obj, null, 2), () => {
            callback ? callback() : null;
        })
}
