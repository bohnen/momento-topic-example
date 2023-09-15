import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import './index.css';
import { Execution } from './momento/api';

// table component columns definition
const columnHelper = createColumnHelper<Execution>();

const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: (row) => <p className='text-right px-2'>{
            row.getValue() ? row.getValue().toLocaleString("en-US") : ''
        }</p>
    }),
    columnHelper.accessor('amount', {
        header: 'Amount',
        cell: (row) => <p className='text-right px-2'>{row.getValue()}</p>
    }),
    columnHelper.accessor('side', {
        header: 'Side',
        cell: (row) => {
            if (row.getValue() === 'buy') {
                return <p className="text-blue-500">{row.getValue()}</p>
            } else {
                return <p className="text-red-500">{row.getValue()}</p>
            }
        }
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (row) => {
            if (row.getValue() === 'done') {
                return <p className="text-green-500">{row.getValue()}</p>
            } else {
                return <p className="text-gray-500">{row.getValue()}</p>
            }
        }
    }),
    columnHelper.accessor('executed_price', {
        header: 'Execution Rate',
        cell: (row) => <p className='text-right px-2'>{
            row.getValue() ? row.getValue().toLocaleString("en-US") : ''
        }</p>
    }),
    columnHelper.accessor('executed_time', {
        header: 'Execution Time',
    }),
]

type TableProps = {
    data: Execution[];
}

export function Table({data}: TableProps) {
    const table = useReactTable({
        columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
    });
    return (
        <table className='table-auto text-center'>
            <thead className='bg-gray-50 text-gray-500'>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className='px-6'>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}