
const ClientCommandList = {
    GET_WORKFLOW_LIST: 'GET:workflows-list',
    GET_WORKFLOW: 'GET:workflow',// {id:'workflow-id'}
    GET_WORKFLOW_STATS: 'GET:stats',// {workflowId:'workflow-id'}
    PUT_WORKFLOW: 'PUT:workflow',// new WorkflowData(); // basically all the data
    DELETE_WORKFLOW: 'DELETE:workflow',// {id:'workflow-id'}
    START_WORKFLOW: 'START:workflow',// {id:'workflow-id'}
    STOP_WORKFLOW: 'STOP:workflow'// {id:'workflow-id'}
}
const ClientCommandPayloads = {
    GET_WORKFLOW_LIST: null,
    GET_WORKFLOW: {id: 'TEST'},// {id:'workflow-id'}
    GET_WORKFLOW_STATS: {workflowId: 'workflow-id'},
    PUT_WORKFLOW: {id: 'TEST', some: true, other: 'stuff'},
    DELETE_WORKFLOW: {id: 'workflow-id'},
    START_WORKFLOW: {id: 'workflow-id'},
    STOP_WORKFLOW: {id: 'workflow-id'},
}

const connectToWs = (cb) => {
    const ws = new WebSocket('ws://localhost:9898');
    ws.addEventListener('open', () => {
        cb();
        console.log('open:', ws);
    });
    ws.addEventListener('message', event => {
        console.log('message', JSON.parse(event.data));
    })
    ws.addEventListener('close', event => {
        console.log('close:', event);
    });
    return ws;
}

const requestJsonFiles = fileNames => {
    return Promise.all(
        fileNames.map(file => {
            return fetch(`./${file}.json`)
                .then(response => response.json())
        })
    )
}
const files = [
    'mockWorkflowDataV2_Gate_Simple',
    'mockWorkflowDataV2_Signal_Simple',
    'mockWorkflowDataV2_TaskOnly_API',
    'mockWorkflowDataV2_TaskOnly_SE'
];
let fileContents = [];
let sock;
requestJsonFiles(files).then(results => {
    fileContents = [...results];
    console.log(results);
    var editor = window.CodeMirror.fromTextArea(document.querySelector('textarea'), {
        mode: {name: "javascript", json: true},
        theme:'idea',
        lineNumbers: true,
        // lineWrapping: true,
        extraKeys: {
            "Ctrl-Q": function (cm) {
                cm.foldCode(cm.getCursor());
            }
        },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        foldOptions: {
            widget: (from, to) => {
                var count = undefined;

                // Get open / close token
                var startToken = '{', endToken = '}';
                var prevLine = window.editor_json.getLine(from.line);
                if (prevLine.lastIndexOf('[') > prevLine.lastIndexOf('{')) {
                    startToken = '[', endToken = ']';
                }

                // Get json content
                var internal = window.editor_json.getRange(from, to);
                var toParse = startToken + internal + endToken;

                // Get key count
                try {
                    var parsed = JSON.parse(toParse);
                    count = Object.keys(parsed).length;
                } catch (e) {
                }

                return count ? `\u21A4${count}\u21A6` : '\u2194';
            }
        }
    });
    editor.setValue(JSON.stringify(results, null, 2));
    // editor.foldCode(CodeMirror.Pos(0, 0));
    results.map(result => {
        const button = document.createElement('button');
        button.setAttribute('id', result.workflow.Id);
        button.innerText = `Start:${result.workflow.Id} | ${result.workflow.Description}`;
        // const code = document.createElement('code')
        // code.innerText = `${JSON.stringify(result,null,2)}`;
        button.addEventListener('click', () => {
            if (sock) {
                sock.send(
                    JSON.stringify({command: ClientCommandList.START_WORKFLOW, payload: {id: result.workflow.Id}})
                );
            }
        })
        document.body.appendChild(button)
        // document.body.appendChild(code)
    })
})
document.querySelector('#putWorkflow').addEventListener('click', () => {
    console.log('click');
    if (fileContents.length) {
        sock = connectToWs(() => {
            fileContents.forEach(result => {
                sock.send(
                    JSON.stringify({command: ClientCommandList.PUT_WORKFLOW, payload: result})
                );
            })
        });
    }
})


