import {WorkFlow} from "../src/workflow";
import {EventTypes, StateStatus} from "../src/utils/status.enum";
import {
    mockWorkflowData_Gate_Simple,
    mockWorkflowData_Signal_Simple,
    mockWorkflowData_TaskOnly_API,
    mockWorkflowData_TaskOnly_SE,
} from './mocks/workflow-data.mock';
import {filterLogsByType, filterLogsOutput, writeJsonLogs} from './mocks/utils.mocks'
import {DataEvent} from "../src/types/workflow.type";

describe('Workflow should...', () => {

    let logs: DataEvent[];
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // configData = mockWorkflowData();
        // wf = new WorkFlow(configData);
        logs = [];
    });

    test('emit the end Event when finished', done => {
        const wf = new WorkFlow(mockWorkflowData_TaskOnly_SE());
        wf.on(EventTypes.End, () => {
            done();
        });
        wf.start();
    })
    // 1. Should execute a script Task
    test('execute a script Task', (done) => {
        const mockData = mockWorkflowData_TaskOnly_SE();
        const wf = new WorkFlow(mockData);
        wf.onLog(log => {
            logs.push(log);
        })
        wf.on(EventTypes.End, () => {
            try {
                expect(filterLogsByType(logs, EventTypes.Error).length).toBe(0);
                expect(filterLogsOutput(logs, 'Workflow:Error').length).toBe(0);
                expect(filterLogsOutput(logs, 'Element:Error').length).toBe(0);
                //writeJsonLogs(logs, () => {
                    done();
                //});
            } catch (e) {
               // writeJsonLogs(logs, () => {
                 //   fs.writeFileSync('./tests/wf-log.json', JSON.stringify(mockData, null, 2));
                    done(e);
                //});
            }
        });
        wf.start()
    })
    // 2. Should execute a apiCall Task
    test('execute a apiCall Task', (done) => {
        const wf = new WorkFlow(mockWorkflowData_TaskOnly_API());
        wf.onLog(log => {
            logs.push(log);
        })
        wf.on(EventTypes.End, () => {
            try {
                expect(filterLogsOutput(logs, 'Workflow:Error').length).toBe(0);
                expect(filterLogsOutput(logs, 'Element:Error').length).toBe(0);
                done();
            } catch (e) {
                done(e);
            }
        });
        wf.start()
    })
    // 3. Should execute a pick correct path on Gate execution
    test(`execute a pick correct path on Gate execution`, done => {
        const mockData = mockWorkflowData_Gate_Simple();
        const wf = new WorkFlow(mockData);
        wf.onLog(log => {
            logs.push(log);
        })
        wf.on(EventTypes.End, () => {
            try {
                // no errors
                expect(filterLogsByType(logs, EventTypes.Error).length).toBe(0);
                // Gate was executed
                expect(filterLogsOutput(logs, 'Gate').length).toBe(1);
                // Check for element that got executed
                expect(filterLogsOutput(logs, mockData.elements[3].Id).length).toBeGreaterThanOrEqual(1);
                // Check for element that didn't get executed
                expect(filterLogsOutput(logs, mockData.elements[2].Id).length).toBe(0);

                //writeJsonLogs(logs,() => {
                    done();
                //});
            } catch (e) {
               // writeJsonLogs(logs,() => {
                //    fs.writeFileSync('./tests/wf-log.json', JSON.stringify(mockData, null, 2));
                    done();
               // });
            }

        });
        wf.start()
    })
    // 4. Should send out a signal for workflow execution
    test('send out a signal when starting a Signal', done => {
        const mockData = mockWorkflowData_Signal_Simple();
        const wf = new WorkFlow(mockData);
        wf.onSignal((signal: DataEvent) => {
            done();
        })
        wf.start();
    })
    // 5. Should Pause workflow when a signal element is started
    test('pause workflow when a signal element is started', done => {
        const mockData = mockWorkflowData_Signal_Simple();
        const wf = new WorkFlow(mockData);

        wf.onLog(log => {
            logs.push(log);
        })
        wf.onSignal((signal: DataEvent) => {
            try {
                expect(wf.data.workFlowStatus).toBe(StateStatus.Idle)
                expect(JSON.parse(signal.data.output as string).data).toBe('THIS_IS_THE_SIGNAL');
                // writeJsonLogs(logs, () => {
                    done();
                // });
            } catch (e) {
                // writeJsonLogs(logs, () => {
                    done(e);
                // });
            }

        })
        wf.on(EventTypes.End, () => {
            try { // auto fail if we hit this since execution actually continued
                expect(false).toBeTruthy()
            } catch (e) {
                // writeJsonLogs(logs, () => {
                    done(e);
                // });
            }
        })
        wf.start();
    })
    // 6. Should Resume when a signal is triggered
    test('resume workflow when a signal is triggered from outside workflow', done => {
        const mockData = mockWorkflowData_Signal_Simple();
        const wf = new WorkFlow(mockData);

        wf.onLog(log => {
            logs.push(log);
        })
        wf.onSignal((signal: DataEvent) => {
            try {
                setTimeout(() => {
                    wf.sendSignal(JSON.parse(signal.data.output as string).data);
                }, 500)
            } catch (e) {
                // writeJsonLogs(logs, () => {
                    done(e);
                // });
            }

        })
        wf.on(EventTypes.End, () => {
            try { // auto done if we hit this since execution actually continued
                expect(true).toBeTruthy()
                // writeJsonLogs(logs, () => {
                    done();
                // });
            } catch (e) {
                // writeJsonLogs(logs, () => {
                    done(e);
                // });
            }
        })
        wf.start();
    })
    // 7. For the same input the workflow should have the same output
    // test('should have the same logs for a fixed input', done => {
    //
    //
    //     wf.onLog(data => {
    //         logs.push(data);
    //     });
    //     wf.on(EventTypes.End, () => {
    //         // Uncomment this to write the config to disk
    //         // fs.writeFileSync('./tests/task_scripts/test-val.json', JSON.stringify(configData,null,2))
    //         // Uncomment this to write the outcome to disk
    //         // fs.writeFile('./tests/task_scripts/outcome.json', JSON.stringify(logs,null,2),()=>{
    //         expect(logs.toString()).toBe(outcome.toString())
    //         done();
    //         // });
    //     });
    //     wf.Start();
    // })

})
