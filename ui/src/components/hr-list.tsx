import { useState, useRef } from 'react';
export type HrItem = {
    name: string;
    description: string;
}

const handleScroll = (event: React.WheelEvent<HTMLDivElement>, parentContainerRef: React.MutableRefObject<HTMLDivElement | null>) => {
    console.log('scrolling');
    if (!parentContainerRef) return;

    const parentContainer = parentContainerRef.current;
    if (parentContainer) {
        const { deltaY } = event;
        parentContainer.scrollLeft += deltaY;
    }
};

export function HrList({ list, select, onSelection }: { list: HrItem[], select?: number, onSelection?: (item: HrItem, index: number) => void }) {
    const [selected, setSelected] = useState(select || 0);
    const totalWidth = list.map((itm, index) => `${itm.name}-${index}`.length).reduce((a, b) => a + b, 0) * 16;
    const parentContainerRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

    const handleSelection = (index: number, item: HrItem) => {
        setSelected(index);
        if (onSelection) onSelection(item, index);
    }

    return (
        <>
            <div className="flex justify-start w-full">
                <div className="space-x-4 w-full overflow-hidden" ref={parentContainerRef} onWheel={(event) => handleScroll(event, parentContainerRef)}>
                    <div className="tabs tabs-boxed m-0 relative w-full" style={({ width: totalWidth })} >
                        {list.map((item: HrItem, index: number) =>
                            (<span onClick={() => handleSelection(index, item)} key={index} className={index === selected ? 'tab tab-lg tab-lifted tab-active' : 'tab tab-lg tab-lifted'}>{item.name}</span>))
                        }
                    </div>
                </div>
            </div>
        </>
    )
}