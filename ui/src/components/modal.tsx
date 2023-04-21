import { ReactNode, useEffect, useState } from "react";

export function Modal({ visible, content, actions }: { visible?: boolean, content?: ReactNode, actions?: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const toggleModalClass = () => isVisible ? 'block' : 'hidden';
    const backdropClass = () => `flex fixed top-0 left-0 w-[100%] h-[100%] backdrop-blur ${toggleModalClass()}`;
    const modalBody = (event: any) => {
      event.stopPropagation();
      event.preventDefault();
    }
    useEffect(() => {
      setIsVisible(visible || false);
    }, [visible])
    return (
      <div className={backdropClass()} onClick={() => setIsVisible(false)}>
        <div className="card w-[50%] h-[50%] fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-neutral text-neutral-content border-2 border-indigo-400" onClick={modalBody}>
          <div className="p-3 h-full text-center">
            <div className="card-content overflow-y-auto overflow-x-hidden h-[80%] block w-full">
              {content}
            </div>
            <div className="card-actions h-[20%] w-full shadow-0 justify-end">
              {actions}
            </div>
          </div>
        </div>
      </div>
    )
  }