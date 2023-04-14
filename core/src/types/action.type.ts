
export interface ScriptResponse {
    output: string;
}

export interface ScriptModule {
    execute: () => string
}
