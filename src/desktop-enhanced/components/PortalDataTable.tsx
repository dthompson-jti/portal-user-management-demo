import React, { useState, useMemo } from 'react';
import { ColumnDef, RowSelectionState, OnChangeFn, HeaderContext, CellContext } from '@tanstack/react-table';
import { DataTable } from '../../desktop/components/DataTable';
import { RowContextMenu } from '../../desktop/components/RowContextMenu';
import { COLUMN_WIDTHS } from '../../desktop/components/tableConstants';
import { Button } from '../../components/Button';
import { TablePagination } from '../../components/TablePagination';
import styles from './PortalDataTable.module.css';

export interface PortalRowActionConfig {
    label: string;
    icon: string;
    destructive?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'on-solid' | 'destructive';
    onClick?: () => void;
}

interface PortalDataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;
    onRowAction?: (row: T) => void;
    // Backwards compat for old onRevokeRow calls
    onRevokeRow?: (row: T) => void;

    // New Feature Props
    densityMode?: 'compact' | 'quick-actions';
    groupBy?: string; // e.g. 'status', 'role'
    actionLabel?: string;
    actionIcon?: string;
    getRowAction?: (row: T) => PortalRowActionConfig;
    hideHeaderControlsWhenEmpty?: boolean;
    pageSize?: number;
}

export function PortalDataTable<T extends { id: string }>({
    data,
    columns,
    isLoading,
    emptyState,
    rowSelection = {},
    onRowSelectionChange,
    onRowAction,
    onRevokeRow,
    densityMode = 'compact',
    groupBy = 'none',
    actionLabel = 'Revoke',
    actionIcon = 'no_accounts',
    getRowAction,
    hideHeaderControlsWhenEmpty = false,
    pageSize: initialPageSize = 10,
}: PortalDataTableProps<T>) {
    const lastClickedRowRef = React.useRef<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalItems = data.length;

    // Reset to page 1 when data changes (e.g. after grant/revoke)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [totalItems]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize]);

    const showPagination = totalItems > pageSize;

    const handleRowAction = onRowAction || onRevokeRow;
    const shouldShowHeaderControls = data.length > 0 || !hideHeaderControlsWhenEmpty;

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

    const isQuickActions = densityMode === 'quick-actions';

    const augmentedColumns: ColumnDef<T, unknown>[] = [
        ...(!isQuickActions && shouldShowHeaderControls ? [{
            id: 'select',
            header: ({ table }: HeaderContext<T, unknown>) => (
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
            cell: ({ row }: CellContext<T, unknown>) => (
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
        }] : []),
        ...columns,
        ...(shouldShowHeaderControls ? [{
            id: 'actions',
            header: () => null,
            size: isQuickActions ? 120 : 48,
            minSize: isQuickActions ? 120 : 48,
            maxSize: isQuickActions ? 120 : 48,
            enableSorting: false,
            enableResizing: false,
            cell: ({ row }: CellContext<T, unknown>) => {
                const defaultAction: PortalRowActionConfig = {
                    label: actionLabel,
                    icon: actionIcon,
                    onClick: () => handleRowAction?.(row.original),
                    destructive: actionLabel.includes('Revoke'),
                    variant: actionLabel.includes('Revoke') ? 'secondary' : 'primary',
                };
                const resolvedAction = getRowAction?.(row.original) ?? defaultAction;

                return (
                    <div className={styles.actionsCellWrapper}>
                        {isQuickActions ? (
                            <Button 
                                variant={resolvedAction.variant ?? (resolvedAction.destructive ? 'secondary' : 'primary')}
                                size="s"
                                onClick={resolvedAction.onClick}
                            >
                                <span className={`material-symbols-rounded`} style={{ fontSize: '18px', marginRight: '4px' }}>
                                    {resolvedAction.icon}
                                </span>
                                {resolvedAction.label}
                            </Button>
                        ) : (
                            <RowContextMenu
                                actions={[
                                    {
                                        label: 'View details',
                                        icon: 'info',
                                        onClick: () => { /* View details */ },
                                    },
                                    {
                                        label: resolvedAction.label,
                                        icon: resolvedAction.icon,
                                        onClick: resolvedAction.onClick ?? (() => handleRowAction?.(row.original)),
                                        destructive: resolvedAction.destructive,
                                    }
                                ]}
                            />
                        )}
                    </div>
                );
            }
        }] : [])
    ];

    // Option B Implementation: Partitioned Data Grouping (Prototype only)
    if (groupBy !== 'none' && data.length > 0) {
        // Group data
        const groupedData = data.reduce((acc, row) => {
            const rawValue = (row as Record<string, unknown>)[groupBy];
            const key = typeof rawValue === 'string' ? rawValue : 'Unknown';
            if (!acc[key]) acc[key] = [];
            acc[key].push(row);
            return acc;
        }, {} as Record<string, T[]>);

        return (
            <div className={styles.wrapper}>
                {Object.entries(groupedData).map(([groupName, groupItems]) => (
                    <div key={groupName} className={styles.groupContainer}>
                        <div className={styles.groupHeader}>
                            <span>{groupName}</span>
                            <span className={styles.groupCount}>({groupItems.length})</span>
                        </div>
                        <DataTable
                            data={groupItems}
                            columns={augmentedColumns}
                            isLoading={isLoading}
                            emptyState={emptyState}
                            enableRowSelection={!isQuickActions}
                            rowSelection={rowSelection}
                            onRowSelectionChange={onRowSelectionChange}
                            getRowId={(row: T) => row.id}
                            onRowClick={handleRowClick}
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Default Render
    return (
        <div className={styles.wrapper}>
            <DataTable
                data={paginatedData}
                columns={augmentedColumns}
                isLoading={isLoading}
                emptyState={emptyState}
                enableRowSelection={!isQuickActions}
                rowSelection={rowSelection}
                onRowSelectionChange={onRowSelectionChange}
                getRowId={(row: T) => row.id}
                onRowClick={handleRowClick}
                hideFooter={showPagination}
            />
            {showPagination && (
                <TablePagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
}
