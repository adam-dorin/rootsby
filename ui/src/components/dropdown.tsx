import { useEffect, useRef, useState } from "react";

export type DropdownItem = {
    label: string;
    value: string;
}
export function Dropdown({ items, onChange, selected }: { items: DropdownItem[], onChange?: (item: DropdownItem) => void, selected?: DropdownItem }) {
    const [selectedItem, setSelectedItem] = useState({} as DropdownItem);
    const outClickRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
    useEffect(() => {
        if (selected) {
            setSelectedItem(selected);
        }
    }, [selected]);
    useEffect(() => {
        (outClickRef?.current as HTMLDivElement).click()
    }, [selectedItem]);
    return (
        <>
            <div ref={outClickRef} />
            <div className="dropdown">
                <label tabIndex={0} className="btn m-1">{selectedItem?.label||'Select ...'}</label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    {items.map((item, index) => {
                        return (
                            <li key={index}>
                                <a onClick={() => { setSelectedItem(item); onChange && onChange(item) }}>{item.label}</a>
                            </li>)
                    })}
                </ul>
            </div>
        </>
    )
}