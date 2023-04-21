import { ReactNode } from "react";


export type TableColumn = {
    label: string;
    type: string;
    value: string;
}
export type TableRow = {
    [key: string]: string | ReactNode;
}

export function TableList({ columns, data }: { columns: TableColumn[], data: TableRow[] }) {

    const processedData = data.map((row) => {
        return columns.map((column) => {
            return {
                label: column.label,
                value: row[column.value]
            }
        })
    });
    return (
        <div className="overflow-x-auto w-full">
            <table className="table w-full">
                <thead>
                    <tr>
                        {columns.map((column, index) => {
                            return (
                                <th key={index}>{column.label}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {processedData.map((row, rowIndex) => {
                        return (
                            <tr key={rowIndex}>
                                {row.map((col, colIndex) => {
                                    return (
                                        <td key={colIndex}>{col.value}</td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>

            </table>
        </div>
    )
}