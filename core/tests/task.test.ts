import {
    mockTaskData_Task_Api_Call,
    mockTaskData_Task_Script_Execution,
    mockTaskData_Task_Script_Execution_Error
} from "./mocks/workflow-data.mock";
import {Task} from "../src/task.element";
import {AndAlwaysPush, Observable} from "../src/utils/event.observer";
import {DataEvent} from "../src/types/workflow.type";
import {EventTypes} from "../src/utils/status.enum";
import {filterLogsByType, filterLogsOutput, writeJsonLogs} from "./mocks/utils.mocks";
import fs from 'fs';
/*
A task should...
1. Execute code for 'ScriptExecution' type
2. Call API for `ApiCall` type
3. Error and End if no state is provided
4. Error and End if no API call fails
5. Error and End if script errors out
6. Error and End if parsedData can't be parsed
7. Error and End if parsedData be parsed but is invalid
8. Error and End if State.Type is invalid

 */
describe('A task should...', () => {
    let observer: Observable<DataEvent>;
    let logs: DataEvent[]
    beforeEach(() => {
        observer = new Observable<DataEvent>();
        logs = [];
        observer.subscribe(AndAlwaysPush, data => {
            logs.push(data);
        })
    })

    // 1. Execute code for 'ScriptExecution' type
    test('Execute code for `ScriptExecution` type', done => {

        const taskData = mockTaskData_Task_Script_Execution();
        const taskInstance = new Task(taskData, observer)
        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, data => {
            done();
        })
        taskInstance.start()
    })

// 2. Call API for `ApiCall` type
    test('Call API for `ApiCall` type', done => {

        const taskData = mockTaskData_Task_Api_Call();
        const taskInstance = new Task(taskData, observer)
        // observer.Subscribe('TEST:LOG',console.log)
        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, data => {
            done();
        })
        taskInstance.start()
    })
    // 3. Error and End if no state is provided
    test('Error and End if no state is provided after calling Start()', done => {

        const taskData = mockTaskData_Task_Script_Execution();
        taskData.State = undefined;
        const taskInstance = new Task(taskData, observer)

        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, data => {
            try {
                expect(filterLogsOutput(logs, 'Element:Error').length).toBeGreaterThanOrEqual(1);
                expect(filterLogsOutput(logs, 'End:Element').length).toBeGreaterThanOrEqual(1);
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start()
    })
    // 4. Error and End if no API call fails
    test('Error and End if no API call fails', done => {

        const taskData = mockTaskData_Task_Api_Call();
        //==========================================
        const data = JSON.parse(taskData.State.Data);
        data['url'] = 'https://localhost:112233';
        taskData.State.Data = JSON.stringify(data);
        //==========================================
        const taskInstance = new Task(taskData, observer)

        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, data => {
            try {
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start();
    })
    // 5. Error and End if script errors out
    test('Error and End if script errors out', done => {
        const taskData = mockTaskData_Task_Script_Execution_Error();
        const taskInstance = new Task(taskData, observer)

        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, () => {
            try {
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start();
    });
    // 6. Error and End if parsedData can't be parsed
    test('Error and End if parsedData can\'t be parsed on Start()', done => {

        const taskData = mockTaskData_Task_Script_Execution();
        //====================================
        taskData.State.Data = 'THIS_WILL_NOT_BE_PARSED';
        //====================================
        const taskInstance = new Task(taskData, observer)
        //====================================
        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, () => {
            try {
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start();
    });
// 7. Error and End if parsedData can be parsed but is invalid
    test('Error and End if parsedData be parsed but is invalid on Start()', done => {

        const taskData = mockTaskData_Task_Script_Execution();
        //====================================
        taskData.State.Data = JSON.stringify("null");
        //====================================
        const taskInstance = new Task(taskData, observer)
        //====================================
        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, () => {
            try {
                // writeJsonLogs(logs);
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start();
    });
    // 8. Error and End if State.Type is invalid
    test('Error and End if State.Type is invalid on Start()', done => {

        const taskData = mockTaskData_Task_Script_Execution();
        //====================================
        taskData.State.Type = 'THIS_TYPE_IS_INVALID';
        //====================================
        const taskInstance = new Task(taskData, observer)
        //====================================
        observer.subscribe(`Element:${taskInstance.Data.Id}:${EventTypes.End}`, () => {
            try {
                // writeJsonLogs(logs);
                expect(filterLogsByType(logs, EventTypes.End).length).toBeGreaterThanOrEqual(1)
                expect(filterLogsByType(logs, EventTypes.Error).length).toBeGreaterThanOrEqual(1)
                done();
            } catch (e) {
                done(e);
            }
        })
        taskInstance.start();
    });

})
