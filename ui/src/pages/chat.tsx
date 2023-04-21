import { FormGenerator, InputType } from '../components/form-generator';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { HrItem, HrList } from '../components/hr-list';
import axios from 'axios';
import * as uuid from 'uuid';
import { useEffectOnce } from '../use-effect-once';

import { API_URL } from '../utils'
import { TableColumn, TableList, TableRow } from '../components/table';
import { Modal } from '../components/modal';

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

const inputs = [
  { label: "Name", type: "text", value: "Dorin Adam" },
  { label: "Age", type: "number", value: "" },
  { label: "Email", type: "email", value: "" }
] as InputType[];

const list = [] as HrItem[];
const messages = [] as ChatMessage[];

const promptColumns = [
  { label: 'Prompt Name', type: 'text', value: 'name' },
  { label: 'Description', type: 'text', value: 'description' },
  { label: 'Action', type: 'text', value: 'action' },
] as TableColumn[];

const promptRowData = [
  { name: 'one_', description: 'Chat Page not implemented!' },
  { name: 'one_', description: 'Chat Page not implemented!' },
] as TableRow[];

export function ChatPage() {
  const [messageValue, setMessageValue] = useState("");
  const [messageList, setMessageList] = useState([] as any[]);
  const messagesEndRef = useRef(null);
  const [threadList, setThreadList] = useState([] as any[]);
  const [promptList, setPromptList] = useState([{}, {}, {}, {}, {}] as any[]);
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
            <TableList columns={promptColumns} data={promptRowData} />
          </>
        }
        actions={
          <>
            <button className="btn btn-primary">Accept</button>
            <button className="btn btn-ghost">Deny</button>
          </>
        }
      />
    </>
  )
}