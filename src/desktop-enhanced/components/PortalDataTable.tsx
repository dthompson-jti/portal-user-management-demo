import React from 'react';
import { ColumnDef, RowSelectionState, OnChangeFn } from '@tanstack/react-table';
import { DataTable } from '../../desktop/components/DataTable';
import { RowContextMenu } from '../../desktop/components/RowContextMenu';
import { COLUMN_WIDTHS } from '../../desktop/components/tableConstants';
import styles from './PortalDataTable.module.css';

interface PortalDataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onRevokeRow?: (row: T) => void;
}

export function PortalDataTable<T extends { id: string }>({
    data,
    columns,
    isLoading,
    emptyState,
    rowSelection = {},
    onRowSelectionChange,
    onRevokeRow
}: PortalDataTableProps<T>) {
    const lastClickedRowRef = React.useRef<string | null>(null);

    const handleRowClick = React.useCallback((row: T, event: React.MouseEvent, visualIds: string[]) => {
        if (!onRowSelectionChange) return;

        const isMeta = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        onRowSelectionChange((prev: RowSelectionState) => {
            const next = { ...(typeof prev === 'function' ? {} : prev) };
            
            if (isMeta) {
                // Toggle single row
                if (next[row.id]) delete next[row.id];
                else next[row.id] = true;
                lastClickedRowRef.current = row.id;
            } else if (isShift && lastClickedRowRef.current) {
                // Range selection
                const startIdx = visualIds.indexOf(lastClickedRowRef.current);
                const endIdx = visualIds.indexOf(row.id);

                if (startIdx !== -1 && endIdx !== -1) {
                    const range = visualIds.slice(
                        Math.min(startIdx, endIdx),
                        Math.max(startIdx, endIdx) + 1
                    );
                    range.forEach((id: string) => {
                        next[id] = true;
                    });
                }
            } else if (next[row.id]) {
                delete next[row.id];
                lastClickedRowRef.current = row.id;
            } else {
                next[row.id] = true;
                lastClickedRowRef.current = row.id;
            }
            return next;
        });
    }, [onRowSelectionChange]);

    const augmentedColumns: ColumnDef<T, unknown>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className={styles.checkboxCell}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={table.getIsAllRowsSelected()}
                        onClick={(event) => event.stopPropagation()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        aria-label="Select all rows"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className={styles.checkboxCell}>
                    <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={row.getIsSelected()}
                        onClick={(event) => event.stopPropagation()}
                        onChange={row.getToggleSelectedHandler()}
                        aria-label={`Select row ${row.id}`}
                    />
                </div>
            ),
            ...COLUMN_WIDTHS.CHECKBOX,
        },
        ...columns,
        {
            id: 'actions',
            header: () => null,
            ...COLUMN_WIDTHS.ACTIONS,
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div className={styles.actionsCellWrapper}>
                        <RowContextMenu
                            actions={[
                                {
                                    label: 'View details',
                                    icon: 'info',
                                    onClick: () => { /* View details */ },
                                },
                                {
                                    label: 'Revoke access',
                                    icon: 'no_accounts',
                                    onClick: () => onRevokeRow?.(row.original),
                                    destructive: true,
                                }
                            ]}
                        />
                    </div>
                );
            }
        }
    ];

    return (
        <div className={styles.wrapper}>
            <DataTable
                data={data}
                columns={augmentedColumns}
                isLoading={isLoading}
                emptyState={emptyState}
                enableRowSelection={true}
                rowSelection={rowSelection}
                onRowSelectionChange={onRowSelectionChange}
                getRowId={(row: T) => row.id}
                onRowClick={handleRowClick}
            />
        </div>
    );
}
