import {DataEvent, DataFlowElement} from './types/workflow.type';
import {FlowBaseElement} from './base.element';
import {EventTypes} from './utils/status.enum';
import {Observable} from './utils/event.observer';
import axios, {AxiosRequestConfig} from "axios";
import {ScriptResponse} from "./types/action.type";


export class Task extends FlowBaseElement {

    parsedState!: string | AxiosRequestConfig<any>;

    constructor(element: DataFlowElement, observerInstance: Observable<DataEvent>) {
        super(element, observerInstance);
        if (!this.Data.State) {
            this.hasError = true;
            return;
        }
        try {
            this.parsedState = JSON.parse(this.Data.State.Data);
        }catch (e){
            this.hasError = true;
        }
    }

    // TODO: type this
    private static apiCall(apiConfig: AxiosRequestConfig<any>) {
        return axios(apiConfig)
    }

    // TODO: type this
    private static async scriptExecutor(path: string, config: any): Promise<ScriptResponse> {
        return new Promise( (resolve, reject) => {
            import(path).then(script => {
                resolve({ Output: script.default?script.default():script() } as ScriptResponse);
            }).catch(error => {
                reject(error);
            })
        })
    }

    progress(): void {
        const types = ['ScriptExecution','ApiCall'];
        if(!this.Data.State || !types.includes(this.Data.State?.Type)){
            this.error();
            this.end();
            return;
        }

        const ev = this.createEvent(EventTypes.Progress)
        this.events.push(`Element:${this.Data.Id}:${EventTypes.Progress}`, ev);

        if (this.Data.State?.Type === 'ScriptExecution') {
            Task.scriptExecutor(this.parsedState as string, {input: {}}).then(value => {
                const ev = this.createEvent(EventTypes.End)
                ev.Data.Output = value.Output;
                this.end(ev);
            }).catch(error => {
                const log_error = this.createEvent(EventTypes.Error, JSON.stringify(error))
                this.events.push(`TEST:LOG`, log_error);
                this.error();
                this.end();
            })
        }
        if (this.Data.State?.Type === 'ApiCall') {
            Task.apiCall(this.parsedState as AxiosRequestConfig<any>).then(value => {
                const ev = this.createEvent(EventTypes.End)
                ev.Data.Output = JSON.stringify(value.data)
                this.events.push(`TEST:LOG`, ev)
                this.end(ev);
            }).catch(error => {
                const err_log = this.createEvent(EventTypes.Error, JSON.stringify(error))
                this.events.push(`TEST:LOG`, error);
                this.error();
                this.end(err_log);
            })
        }
    }
}
