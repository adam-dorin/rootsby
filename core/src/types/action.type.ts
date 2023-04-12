
export interface ScriptResponse {
    Output: string;
}

export interface ScriptModule {
    execute: () => string
}
