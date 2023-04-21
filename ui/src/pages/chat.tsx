import { FormGenerator, InputType } from '../components/form-generator';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { HrItem, HrList } from '../components/hr-list';
import axios from 'axios';
import * as uuid from 'uuid';
import { useEffectOnce } from '../use-effect-once';

import { API_URL } from '../utils'
import { TableColumn, TableList, TableRow } from '../components/table';
import { Modal } from '../components/modal';
import { Dropdown, DropdownItem } from '../components/dropdown';


// Still need to implement:
// - [ ] Create thread from prompt
// - [ ] Set prompt as active
// - [ ] See the prompt details of the active thread
// - [ ] Create prompt (the form is there, but the API call is not implemented)
// - [ ] Create thread (markup there, but the API call is not implemented)
// - [ ] Create messages for no data scenarios
// - [ ] Initialize promptList from API call
// - [ ] url search params for threadId
// - [ ] url search params for promptId
// - [ ] url search params reaction to promptId and threadId changes ( set and update)

type ChatMessage = {
  content: string;
  author: string;
}

const getMessages = (threadId: string) => {
  console.log(threadId);
  return axios.get(`${API_URL}/thread/${threadId}`);
}

const getThreads = () => {
  return axios.get(`${API_URL}/thread/list`);
}

const sendApiMessage = (text: string, threadId?: string) => {
  const body: { text: string, author: string, threadId?: string } = {
    text: `${text}`,
    author: 'user',
  }
  if (threadId) {
    body.threadId = threadId;
  }
  return axios.post(`${API_URL}/message/send`, body)
}


const promptColumns = [
  { label: 'Prompt Name', type: 'text', value: 'name' },
  { label: 'Action', type: 'text', value: 'action' },
] as TableColumn[];

const onPromptCreate = (prompt: { name: string, model: string, content: string }) => {
  console.log(prompt);
  if (prompt.name && prompt.model && prompt.content) {
    axios.post(`${API_URL}/prompt`, prompt).then(response => {
      console.log(response);
    })
  }
}

function PromptTableActions() {
  return (
    <>
      <button className="btn btn-ghost btn-xs">Set as active</button>
      <button className="btn btn-ghost btn-xs">Create thread from</button>
    </>
  )
}

const promptRowData = [
  { name: 'one_', action: <PromptTableActions /> },
  { name: 'one_', action: <PromptTableActions /> },
] as TableRow[];

function PromptCreate({ onSubmit, onClose }: { onClose?:()=>void, onSubmit: (prompt: { name: string, model: string, content: string }) => void }) {
  const dropdownItems: DropdownItem[] = [
    { label: 'ChatGpt3.5', value: 'gpt-3.5-turbo' },
  ];
  const [model, setModel] = useState({} as DropdownItem);
  const [promptName, setPromptName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const nameRef: React.MutableRefObject<HTMLInputElement | null> = useRef(null);
  const contentRef: React.MutableRefObject<HTMLTextAreaElement | null> = useRef(null);
  return (
    <>
      <div className='flex flex-col justify-center w-full'>
        <p className='mb-3 text-left'>Create new Prompt:</p>
        <input ref={nameRef} onChange={() => setPromptName((nameRef.current as HTMLInputElement).value)} type="text" placeholder="name_of_prompt" className="input input-bordered mb-3 input-secondary w-full max-w-xs" />
        {/* <input type="text" placeholder="Type here" className="input input-bordered mx-auto mb-3 input-secondary w-full max-w-xs" /> */}
        <select className="select select-secondary mb-3 w-full max-w-xs">
          <option disabled selected>Select model...</option>
          {dropdownItems.map((item, index) => {
            return (
              <option onClick={() => setModel(item)} key={index}>{item.label}</option>
            )
          })
          }
        </select>
        <textarea ref={contentRef} onChange={() => setPromptContent((nameRef.current as HTMLInputElement).value)} className="textarea textarea-secondary mb-3 w-[80%]" placeholder="Content"></textarea>
        <div className="w-full flex justify-end">
          <button onClick={()=>onClose && onClose()} className="btn btn-sm">Cancel</button>
          <button onClick={() => onSubmit && onSubmit({ name: promptName, model: model.value, content: promptContent })} className="btn btn-sm">Create</button>

        </div>
      </div>
    </>
  )
}

const inputs = [
  { label: "Name", type: "text", value: "Dorin Adam" },
  { label: "Age", type: "number", value: "" },
  { label: "Email", type: "email", value: "" }
] as InputType[];

const list = [] as HrItem[];
const messages = [] as ChatMessage[];

export function ChatPage() {
  const [messageValue, setMessageValue] = useState("");
  const [messageList, setMessageList] = useState([] as any[]);
  const messagesEndRef = useRef(null);
  const [threadList, setThreadList] = useState([] as any[]);
  const [promptList, setPromptList] = useState([] as any[]);
  const [showPromptCreate, setShowPromptCreate] = useState(false);

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const openPromptsModal = () => {
    setIsPromptModalOpen(true);
  }

  const scrollToBottom = () => {
    (messagesEndRef.current as HTMLDivElement | null)?.scrollIntoView({ behavior: "smooth" })
  }

  const onEnter = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  }

  const sendMessage = () => {
    const trimmed = messageValue.trim();
    if (!trimmed) {
      setMessageValue("");
      return;
    }
    setMessageList([...messageList, { id: uuid.v4(), author: 'user', text: messageValue }]);
    setMessageValue("");
    sendApiMessage(messageValue, '26cd73e7-d2e1-479c-b769-36ecfd62874b').then(response => {
      setMessageList([...messageList, { id: uuid.v4(), author: 'user', text: messageValue }, response.data]);
    })
  }
  const handleSelect = (item: HrItem, index: number) => {
    if (!item && !index) return;
    console.log(item, index);
  }

  useEffectOnce(() => {
    getThreads().then((response) => {
      const tl = response.data.data

      setThreadList([...tl as any[]]);
      if (tl.length > 0) { // if there are threads
        getMessages(tl[0].id).then((response) => {
          setMessageList([...response.data.data as any[]]);
        })
      } else { // if there are no threads
        setMessageList([]);
        openPromptsModal()
      }
    }).catch((error) => {
      console.log(error);
    });

    return () => { }
  })

  useEffect(() => {
    scrollToBottom();
  }, [messageList])


  return (
    <>
      <HrList onSelection={handleSelect} list={threadList.map(th => ({ name: th.name, description: '' } as HrItem))} />
      <div className='my-2'></div>
      <div className="container flex flex-col column my-2 h-[70vh] overflow-auto p-[30px]">

        {messageList.map((message, index) => (
          <div key={index} className={'card w-[75%] my-2  bg-neutral text-neutral-content ' + (message.author === 'user' ? 'mr-auto' : 'ml-auto')}>
            <div className="card-body text-left py-3">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <textarea
        value={messageValue}
        onChange={(e) => setMessageValue(e.target.value)}
        onKeyDown={onEnter}
        className="textarea textarea-primary fixed bottom-[30px] w-[60%] left-[50%] translate-x-[-50%] resize-none"
        placeholder="Bio"></textarea>
      <Modal visible={isPromptModalOpen}
        content={
          <>
            {!showPromptCreate && <TableList columns={promptColumns} data={promptRowData} />}
            {showPromptCreate && <PromptCreate onSubmit={onPromptCreate} onClose={()=>setShowPromptCreate(false)} />}
          </>
        }
        actions={
          <>
            {!showPromptCreate && <button className="btn btn-primary" onClick={() => setShowPromptCreate(true)}>Create Thread</button>}
        
          </>
        }
      />
    </>
  )
}