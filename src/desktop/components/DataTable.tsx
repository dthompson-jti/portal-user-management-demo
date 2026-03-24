// src/desktop/components/DataTable.tsx

import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    RowSelectionState,
    ColumnSizingState,
    ColumnPinningState,
} from '@tanstack/react-table';
import { useState, useEffect, useRef } from 'react';
import { useTableAutoFit } from '../../hooks/useTableAutoFit';
import styles from './DataTable.module.css';

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T, unknown>[];
    enableRowSelection?: boolean;
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: (selection: RowSelectionState) => void;
    getRowId?: (row: T) => string;
    totalCount?: number;
    isLoading?: boolean;
    /** When true, body skeleton rows replace data rows. Managed by useMinDurationSkeleton. */
    showSkeleton?: boolean;
    /** When true, header cells are replaced with skeleton bars (use on full view changes). */
    showHeaderSkeleton?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    onRowClick?: (row: T, event: React.MouseEvent, visualIds: string[]) => void;
    onRowDoubleClick?: (row: T, event: React.MouseEvent, visualIds: string[]) => void;
    initialSorting?: SortingState;
    emptyState?: React.ReactNode;
}

export function DataTable<T>({
    data,
    columns,
    enableRowSelection = false,
    rowSelection = {},
    onRowSelectionChange,
    getRowId,
    totalCount,
    isLoading = false,
    showSkeleton,
    showHeaderSkeleton = false,
    hasMore = false,
    onLoadMore,
    onRowClick,
    onRowDoubleClick,
    initialSorting = [],
    emptyState,
}: DataTableProps<T>) {
    // When showSkeleton is not explicitly controlled, fall back to the old heuristic.
    const shouldShowSkeleton = showSkeleton ?? (isLoading && data.length === 0);
    const isHeaderSkeleton = !!showHeaderSkeleton && shouldShowSkeleton;
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
    const [columnPinning] = useState<ColumnPinningState>({
        left: ['select'],
        right: ['actions'],
    });

    // Column Definitions and Hook Setup handled below



    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            columnSizing,
            columnPinning,
        },
        onSortingChange: setSorting,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: 'onChange',
        onRowSelectionChange: onRowSelectionChange as (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection,
        enableColumnResizing: true,
        enableSortingRemoval: false,
        getRowId,
    });

    const { handleAutoFit } = useTableAutoFit(table, setColumnSizing);

    const sentinelRef = useRef<HTMLTableRowElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    // Initial Width Distribution Logic
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        if (hasInitializedRef.current || !scrollAreaRef.current) return;

        const container = scrollAreaRef.current;
        const observer = new ResizeObserver((entries) => {
            if (hasInitializedRef.current) return;

            const entry = entries[0];
            if (!entry) return;

            const containerWidth = entry.contentRect.width;
            if (containerWidth <= 0) return;

            // Calculate total default width
            const currentTotalWidth = table.getPageCount() > 0 ? table.getTotalSize() : 0;

            // If we have data and the table is smaller than container, distribute space
            if (currentTotalWidth > 0 && currentTotalWidth < containerWidth) {
                const excess = containerWidth - currentTotalWidth;

                // Columns to grow: Resident (Primary), Notes (Secondary), Officer (Tertiary)
                const growableColumns = {
                    'resident': 3,
                    'notes': 2,
                    'officer': 1
                };

                const totalShares = Object.entries(growableColumns).reduce((sum, [id, share]) => {
                    return table.getColumn(id)?.getIsVisible() ? sum + share : sum;
                }, 0);

                if (totalShares > 0) {
                    const newSizing = { ...columnSizing };
                    const pixelPerShare = excess / totalShares;

                    Object.entries(growableColumns).forEach(([id, share]) => {
                        const column = table.getColumn(id);
                        if (column && column.getIsVisible()) {
                            const currentSize = column.getSize();
                            newSizing[id] = Math.floor(currentSize + (pixelPerShare * share));
                        }
                    });

                    setColumnSizing(newSizing);
                }
            }

            hasInitializedRef.current = true;
            // We disconnect this specific observer after one success
            observer.disconnect();
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [table, columnSizing]); // Dependencies need to include table to access columns

    // Load More Observer
    useEffect(() => {
        if (!onLoadMore || !hasMore) return;

        const sentinel = sentinelRef.current;
        const scrollArea = scrollAreaRef.current;
        if (!sentinel || !scrollArea) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    onLoadMore();
                }
            },
            {
                root: scrollArea,
                rootMargin: '0px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [onLoadMore, hasMore]);


    // Compute column widths and pinned offsets once per render
    const tableStyles: React.CSSProperties & Record<string, string | number> = {
        width: table.getTotalSize(),
    };

    table.getVisibleFlatColumns().forEach((column, index, allCols) => {
        const safeId = column.id.replace(/[^a-zA-Z0-9-]/g, '-');
        tableStyles[`--col-${safeId}-width`] = `${column.getSize()}px`;

        if (column.getIsPinned() === 'left') {
            let leftOffset = 0;
            for (let i = 0; i < index; i++) {
                if (allCols[i].getIsPinned() === 'left') {
                    leftOffset += allCols[i].getSize();
                }
            }
            tableStyles[`--col-${safeId}-left`] = `${leftOffset}px`;
        }
    });

    return (
        <div className={styles.tableContainer}>
            <div ref={scrollAreaRef} className={styles.scrollArea}>
                <table
                    className={styles.table}
                    style={tableStyles}
                >
                    <thead className={styles.thead}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id} className={isHeaderSkeleton ? styles.skeletonHeaderRow : undefined}>
                                {headerGroup.headers.map((header) => {
                                    const isPinned = header.column.getIsPinned();
                                    const isSpacer = header.column.id === 'spacer';
                                    const safeId = header.column.id.replace(/[^a-zA-Z0-9-]/g, '-');

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <th
                                            key={header.id}
                                            className={`${styles.th} ${pinnedClass}`}
                                            colSpan={header.colSpan}
                                            onClick={!isHeaderSkeleton && header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                            style={{
                                                width: isSpacer ? 'auto' : `var(--col-${safeId}-width)`,
                                                padding: isSpacer ? 0 : undefined,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? `var(--col-${safeId}-left)` : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                            data-sortable={!isHeaderSkeleton && header.column.getCanSort()}
                                            data-sorted={!isHeaderSkeleton && !!header.column.getIsSorted()}
                                            data-sort-direction={!isHeaderSkeleton ? header.column.getIsSorted() as string : undefined}
                                        >
                                            {isHeaderSkeleton ? (
                                                // Skeleton: replace label with shimmer bar, wrapped in a
                                                // height-matched container so the <th> matches real header height.
                                                !isSpacer && (
                                                    <div className={styles.skeletonHeaderContent}>
                                                        <div className={
                                                            header.column.id === 'select'
                                                                ? styles.skeletonCheckbox
                                                                : header.column.id === 'actions'
                                                                    ? styles.skeletonAction
                                                                    : styles.skeletonHeaderCell
                                                        } />
                                                    </div>
                                                )
                                            ) : (
                                                <>
                                                    <div className={styles.thContent}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                        {header.column.getCanSort() && (
                                                            <span className={`material-symbols-rounded ${styles.sortIndicator}`}>
                                                                arrow_downward
                                                            </span>
                                                        )}
                                                    </div>
                                                    {header.column.getCanResize() && !isSpacer && (
                                                        <div
                                                            onDoubleClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAutoFit(header.column.id);
                                                            }}
                                                            onMouseDown={header.getResizeHandler()}
                                                            onTouchStart={header.getResizeHandler()}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`${styles.resizer} ${header.column.getIsResizing() ? styles.isResizing : ''
                                                                }`}
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody className={styles.tbody}>
                        {/* Skeleton Loading State */}
                        {shouldShowSkeleton && Array.from({ length: 15 }).map((_, idx) => (
                            <tr key={`skeleton-${idx}`} className={styles.skeletonRow}>
                                {table.getVisibleFlatColumns().map((column) => {
                                    const isPinned = column.getIsPinned();
                                    const isSpacer = column.id === 'spacer';
                                    const safeId = column.id.replace(/[^a-zA-Z0-9-]/g, '-');

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={column.id}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : `var(--col-${safeId}-width)`,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? `var(--col-${safeId}-left)` : undefined,
                                                padding: isSpacer ? 0 : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                        >
                                            {!isSpacer && (
                                                <div
                                                    className={
                                                        column.id === 'select'
                                                            ? styles.skeletonCheckbox
                                                            : column.id === 'actions'
                                                                ? styles.skeletonAction
                                                                : column.id === 'status'
                                                                    ? styles.skeletonStatusPill
                                                                    : styles.skeletonCell
                                                    }
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}

                        {/* Actual Data — hidden while skeleton is active */}
                        {!shouldShowSkeleton && table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className={styles.tr}
                                data-state={row.getIsSelected() ? 'checked' : 'unchecked'}
                                onMouseDown={(e) => {
                                    // INVARIANT: Native Selection Suppression
                                    // Prevent browser's default range selection behavior which causes blue flickers
                                    // during rapid Shift+Click row selection.
                                    if (e.shiftKey) {
                                        e.preventDefault();
                                    }
                                }}
                                onClick={(e) => {
                                    if (onRowClick) {
                                        const visualIds = table.getRowModel().rows.map(r => r.id);
                                        onRowClick(row.original, e, visualIds);
                                    }
                                }}
                                onDoubleClick={(e) => {
                                    if (onRowDoubleClick) {
                                        const visualIds = table.getRowModel().rows.map(r => r.id);
                                        onRowDoubleClick(row.original, e, visualIds);
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => {
                                    const isPinned = cell.column.getIsPinned();
                                    const isSpacer = cell.column.id === 'spacer';
                                    const safeId = cell.column.id.replace(/[^a-zA-Z0-9-]/g, '-');

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={cell.id}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : `var(--col-${safeId}-width)`,
                                                padding: isSpacer ? 0 : undefined,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? `var(--col-${safeId}-left)` : undefined,
                                            }}
                                            data-pinned={isPinned || undefined}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        {/* Infinite scroll sentinel — only when data is visible */}
                        {!shouldShowSkeleton && hasMore && (
                            <tr ref={sentinelRef} className={styles.skeletonRow}>
                                {table.getVisibleFlatColumns().map((column) => {
                                    const isPinned = column.getIsPinned();
                                    const isSpacer = column.id === 'spacer';
                                    const safeId = column.id.replace(/[^a-zA-Z0-9-]/g, '-');

                                    const pinnedClass = isPinned === 'left'
                                        ? styles.stickyColumnLeft
                                        : isPinned === 'right'
                                            ? styles.stickyColumn
                                            : '';

                                    return (
                                        <td
                                            key={`sentinel-${column.id}`}
                                            className={`${styles.td} ${pinnedClass}`}
                                            style={{
                                                width: isSpacer ? 'auto' : `var(--col-${safeId}-width)`,
                                                position: isPinned ? 'sticky' : undefined,
                                                right: isPinned === 'right' ? 0 : undefined,
                                                left: isPinned === 'left' ? `var(--col-${safeId}-left)` : undefined,
                                                padding: isSpacer ? 0 : undefined,
                                            }}
                                        >
                                            {!isSpacer && (
                                                <div
                                                    className={
                                                        column.id === 'select'
                                                            ? styles.skeletonCheckbox
                                                            : column.id === 'actions'
                                                                ? styles.skeletonAction
                                                                : styles.skeletonCell
                                                    }
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        )}
                    </tbody>
                </table>
                {table.getRowModel().rows.length === 0 && !isLoading && !shouldShowSkeleton && data.length === 0 && (
                    emptyState || (
                        <div className={styles.emptyState}>

                            <p>No data to display</p>
                        </div>
                    )
                )}

                {/* Table Footer - Moved inside scrollArea for better sticky behavior */}
                <div className={styles.tableFooter}>
                    <div className={styles.footerLeft}>
                        {/* Stays in loading state for the full skeleton duration (min 1s on view change) */}
                        {(isLoading || shouldShowSkeleton) ? (
                            <div className={styles.loadingIndicator}>
                                <span className={`material-symbols-rounded ${styles.loadingSpinner}`}>
                                    progress_activity
                                </span>
                                <span>Loading records...</span>
                            </div>
                        ) : (
                            <div className={styles.footerCount}>
                                Showing {data.length.toLocaleString()} of {(totalCount ?? data.length).toLocaleString()} results
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
