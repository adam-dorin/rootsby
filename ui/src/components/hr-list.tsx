import { useState } from 'react';
export type HrItem = {
    name: string;
    description: string;
}

export function HrList({ list, select }: { list: HrItem[], select?: number }) {
    const [selected, setSelected] = useState(select||0);
    return (
        <>
            <div className="flex justify-start w-full">
                <div className="flex items-center space-x-4 w-full">
                    <div className="tabs tabs-boxed m-0 relative w-full">
                        {list.map((item: HrItem, index: number) =>
                            (<span onClick={() => setSelected(index)} key={index} className={index === selected ? 'tab tab-lg tab-lifted tab-active' : 'tab tab-lg tab-lifted'}>{item.name}</span>))
                        }
                    </div>
                </div>
            </div>
        </>
    )
}