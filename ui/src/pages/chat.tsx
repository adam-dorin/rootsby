import { FormGenerator, InputType } from '../components/form-generator';
import { HrItem, HrList } from '../components/hr-list';
const inputs = [
    { label: "Name", type: "text", value: "Dorin Adam" },
    { label: "Age", type: "number", value: "" },
    { label: "Email", type: "email", value: "" }
] as InputType[];

const list = [
    { name: 'one_', description: 'Chat Page not implemented!' },
    { name: 'one_', description: 'Chat Page not implemented!' },
    { name: 'one_', description: 'Chat Page not implemented!' },
    { name: 'one_', description: 'Chat Page not implemented!' },
    { name: 'one_', description: 'Chat Page not implemented!' },
] as HrItem[];

export function ChatPage() {
    return (
      <>
        <HrList list={list} />
        <div className='my-4'></div>
        <FormGenerator inputs={inputs} />
      </>
    )
  }