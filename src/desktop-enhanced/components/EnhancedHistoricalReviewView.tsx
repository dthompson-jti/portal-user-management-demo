// src/desktop-enhanced/components/EnhancedHistoricalReviewView.tsx
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
    selectedHistoryRowsAtom,
    activeDetailRecordAtom,
    desktopFilterAtom,
    supervisorNoteModalAtom,
    historicalRefreshAtom,
    PanelData,
    isDetailPanelOpenAtom,
    residentDisplayModeAtom,
    residentBadgeTextAtom,
    dimLocationBreadcrumbsAtom,
    tableFontWeightAtom,
    isNoResultsAtom
} from '../../desktop/atoms';
import { HistoricalCheck } from '../../desktop/types';
import { DataTable } from '../../desktop/components/DataTable';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { RowContextMenu } from '../../desktop/components/RowContextMenu';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { ResidentChip } from '../../desktop/components/ResidentChip';
import { ResidentStatusGroup } from '../../desktop/components/ResidentStatusGroup';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { loadEnhancedHistoricalPage } from '../data/mockData';
import { COLUMN_WIDTHS } from '../../desktop/components/tableConstants';
import { TimestampCell } from '../../desktop/components/TimestampCell';
import styles from '../../desktop/components/DataTable.module.css';


export const EnhancedHistoricalReviewView = () => {
    const [selectedRows, setSelectedRows] = useAtom(selectedHistoryRowsAtom);
    const setDetailRecord = useSetAtom(activeDetailRecordAtom);
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);

    // Pagination State
    const [loadedData, setLoadedData] = useState<HistoricalCheck[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const setIsNoResults = useSetAtom(isNoResultsAtom);

    const filter = useAtomValue(desktopFilterAtom);
    const displayMode = useAtomValue(residentDisplayModeAtom);
    const badgeTextMode = useAtomValue(residentBadgeTextAtom);
    const dimBreadcrumbs = useAtomValue(dimLocationBreadcrumbsAtom);
    const tableFontWeight = useAtomValue(tableFontWeightAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);
    const refreshCount = useAtomValue(historicalRefreshAtom);


    // Initial load & Re-fetch on refreshCount change

    // Initial load & Re-fetch on refreshCount change
    useEffect(() => {
        setIsLoading(true);
        void loadEnhancedHistoricalPage(0, 50, filter).then(({ data, nextCursor, totalCount }) => {
            setLoadedData(data);
            setCursor(nextCursor ?? 0);
            setHasMore(nextCursor !== null);
            setTotalCount(totalCount);
            setIsLoading(false);

            // Sync no results state
            setIsNoResults(data.length === 0);
        });
    }, [filter, refreshCount, setIsNoResults]);


    const handleLoadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        void loadEnhancedHistoricalPage(cursor, 50, filter).then(({ data, nextCursor }) => {
            setLoadedData((prev) => [...prev, ...data]);
            setCursor(nextCursor ?? cursor);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [cursor, isLoading, hasMore, filter]);

    const rowSelection: RowSelectionState = useMemo(() => {
        const selection: RowSelectionState = {};
        selectedRows.forEach((id) => { selection[id] = true; });
        return selection;
    }, [selectedRows]);

    const handleRowSelectionChange = useCallback(
        (updaterOrValue: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
            const newSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
            const newSet = new Set(Object.keys(newSelection).filter((k) => newSelection[k]));
            setSelectedRows(newSet);

            // If selection becomes empty or multiple, clear active single record
            if (newSet.size !== 1) {
                setDetailRecord(null);
            }
        },
        [rowSelection, setSelectedRows, setDetailRecord]
    );

    // Sync active record with selection and loaded data
    useEffect(() => {
        if (selectedRows.size === 1) {
            const id = Array.from(selectedRows)[0];
            const row = loadedData.find(r => r.id === id);
            if (row) {
                const panelData: PanelData = {
                    id: row.id,
                    correlationGuid: row.correlationGuid,
                    source: 'historical',
                    residents: row.residents,
                    residentName: row.residents.map(r => r.name).join(', '),
                    location: row.location,
                    status: row.status,
                    scheduledStartTime: row.scheduledStartTime,
                    scheduledEndTime: row.scheduledEndTime,
                    completedTime: row.completedTime,
                    missedTime: row.missedTime,
                    timeScheduled: row.scheduledTime,
                    timeActual: row.actualTime,
                    varianceMinutes: row.varianceMinutes,
                    officerName: row.officerName,
                    group: row.group,
                    unit: row.unit,
                    officerNote: row.officerNote,
                    supervisorNote: row.supervisorNote,
                    supervisorName: row.supervisorName,
                    reviewDate: row.reviewDate,
                    reviewStatus: row.reviewStatus,
                    roomIdMethod: row.roomIdMethod,
                };
                setDetailRecord(panelData);
            } else {
                // Row not found in loaded data (e.g. filtered out after update)
                // If we have a single selection that isn't in the data, clear it to avoid stale view
                setDetailRecord(null);
                // Also clear selection since it's no longer visible/valid
                setSelectedRows(new Set());
            }
        } else {
            setDetailRecord(null);
        }
    }, [selectedRows, loadedData, setDetailRecord, setSelectedRows]);

    /**
     * INVARIANT: Stable Anchor Pattern
     * We use a ref to track the last "true" click (single or meta) to serve as 
     * the anchor for subsequent Shift-click range expansions.
     */
    const lastClickedRowRef = useRef<string | null>(null);
    const handleRowClick = useCallback((row: HistoricalCheck, event: React.MouseEvent, visualIds: string[]) => {
        const isMeta = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;

        setSelectedRows((_prev: Set<string>) => {
            const next = new Set(_prev);

            if (isMeta) {
                if (next.has(row.id)) next.delete(row.id);
                else next.add(row.id);
                lastClickedRowRef.current = row.id;
            } else if (isShift && lastClickedRowRef.current) {
                // INVARIANT: Visual Order Range
                // Range selection MUST use visualIds (sorted/filtered) from DataTable 
                // to match the user's spatial perception of the list.
                const startIdx = visualIds.indexOf(lastClickedRowRef.current);
                const endIdx = visualIds.indexOf(row.id);

                if (startIdx !== -1 && endIdx !== -1) {
                    const range = visualIds.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
                    range.forEach((id: string) => next.add(id));
                }
                // Important: Don't update anchor on shift-click, so it stays fixed for multiple expansions
            } else {
                // Toggle behavior: if clicking the only selected row, clear it
                if (next.has(row.id) && next.size === 1) {
                    next.delete(row.id);
                    lastClickedRowRef.current = null;
                } else {
                    next.clear();
                    next.add(row.id);
                    lastClickedRowRef.current = row.id;
                }
            }

            return next;
        });
    }, [setSelectedRows]);

    // Determine if we are in "Edit" mode (any selected item has a comment)
    const isEditMode = useMemo(() => {
        if (selectedRows.size === 0) return false;
        for (const id of selectedRows) {
            const row = loadedData.find(r => r.id === id);
            if (row?.supervisorNote) return true;
        }
        return false;
    }, [selectedRows, loadedData]);

    const handleOpenNoteModal = useCallback((checkId: string) => {
        setModalState({
            isOpen: true,
            selectedIds: [checkId],
        });
    }, [setModalState]);

    const columns: ColumnDef<HistoricalCheck>[] = useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className={styles.checkboxCell}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className={styles.checkboxCell}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                        />
                    </div>
                ),
                size: 44,
                minSize: 44,
                maxSize: 44,
                enableResizing: false,
            },

            {
                id: 'resident',
                header: 'Resident',
                size: 300,
                minSize: 240,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => {
                    return (
                        <div className={styles.residentCell}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-0p5)', width: '100%' }}>
                                {row.original.residents.map((r, i) => {
                                    if (displayMode === 'chip') {
                                        return (
                                            <ResidentChip
                                                key={i}
                                                name={r.name}
                                                showHighRisk={r.hasHighRisk}
                                                showMedicalWatch={r.hasMedicalWatch}
                                                textMode={badgeTextMode}
                                            />
                                        );
                                    }

                                    const badges = (
                                        <ResidentStatusGroup residents={[r]} view="table" />
                                    );

                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 'var(--spacing-2)', height: '24px', width: '100%' }}>
                                            {displayMode === 'left-badge' ? (
                                                <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                                                    <span style={{ color: 'var(--surface-fg-primary)' }}>{r.name}</span>
                                                    {badges}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                    <span style={{ color: 'var(--surface-fg-primary)' }}>{r.name}</span>
                                                    {badges}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                },
            },
            {
                id: 'location',
                header: 'Location',
                ...COLUMN_WIDTHS.MERGED_LOCATION,
                accessorFn: (row) => `${row.group} ${row.unit} ${row.location}`,
                sortingFn: (rowA, rowB) => {
                    const a = `${rowA.original.group} ${rowA.original.unit} ${rowA.original.location}`;
                    const b = `${rowB.original.group} ${rowB.original.unit} ${rowB.original.location}`;
                    return a.localeCompare(b);
                },
                cell: ({ row }) => (
                    <div className={styles.locationCell}>
                        <span style={{
                            color: dimBreadcrumbs ? 'var(--surface-fg-secondary)' : 'var(--surface-fg-primary)',
                            fontWeight: (tableFontWeight === 'regular' || dimBreadcrumbs) ? 'var(--font-weight-regular)' : 'var(--font-weight-medium)'
                        }}>{row.original.group}</span>
                        <span className="material-symbols-rounded" style={{ color: 'var(--surface-fg-quaternary)', fontSize: '16px' }}>navigate_next</span>
                        <span style={{
                            color: dimBreadcrumbs ? 'var(--surface-fg-secondary)' : 'var(--surface-fg-primary)',
                            fontWeight: (tableFontWeight === 'regular' || dimBreadcrumbs) ? 'var(--font-weight-regular)' : 'var(--font-weight-medium)'
                        }}>{row.original.unit}</span>
                        <span className="material-symbols-rounded" style={{ color: 'var(--surface-fg-quaternary)', fontSize: '16px' }}>navigate_next</span>
                        <span style={{ color: 'var(--surface-fg-primary)' }}>{row.original.location}</span>
                    </div>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                accessorFn: (row) => row.status,
                size: 200,
                minSize: 100,
                maxSize: 300,
                enableResizing: true,
                enableSorting: true,
                sortingFn: (rowA, rowB) => {
                    const getPriority = (row: typeof rowA) => {
                        const status = row.original.status;
                        const note = row.original.supervisorNote;
                        if (status === 'missed') {
                            return note ? 2 : 1; // 1: Missed (Uncommented) - Highest Priority
                        }
                        if (status === 'completed') return 3;
                        return 4; // Other statuses
                    };
                    return getPriority(rowA) - getPriority(rowB);
                },
                cell: ({ row }) => {
                    let displayStatus: StatusBadgeType;
                    if (row.original.status === 'completed') {
                        displayStatus = 'completed';
                    } else if (row.original.status === 'missed') {
                        displayStatus = row.original.supervisorNote ? 'missed-reviewed' : 'missed-not-reviewed';
                    } else {
                        displayStatus = row.original.status as StatusBadgeType;
                    }
                    return (
                        <div style={{ marginLeft: 'calc(var(--spacing-0p5) * -1)' }}>
                            <StatusBadge status={displayStatus} iconOnly={false} />
                        </div>
                    );
                },
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                size: 180,
                minSize: 160,
                accessorFn: (row) => row.scheduledTime,
                cell: ({ row }) => (
                    <TimestampCell isoString={row.original.scheduledTime} />
                )
            },
            {
                id: 'actual',
                header: 'Actual',
                ...COLUMN_WIDTHS.TIMESTAMP,
                accessorFn: (row) => row.actualTime || '—',
                cell: ({ row }) => (
                    <TimestampCell isoString={row.original.actualTime} />
                )
            },

            {
                id: 'officer',
                header: 'Officer',
                ...COLUMN_WIDTHS.OFFICER,
                accessorKey: 'officerName',
                cell: ({ row }) => row.original.officerName || <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>,
            },

            {
                id: 'supervisorNote',
                header: 'Review',
                size: 200,
                minSize: 150,
                accessorKey: 'supervisorNote',
                cell: ({ row }) => {
                    const note = row.original.supervisorNote;
                    const meta = row.original.supervisorName
                        ? `${row.original.supervisorName} • ${new Date(row.original.reviewDate!).toLocaleString()}`
                        : '';
                    const tooltip = note ? `${note}\n\n${meta}` : null;

                    return (
                        <div className={styles.commentCell}>
                            {note ? (
                                <Tooltip content={tooltip} align="start">
                                    <span className={styles.truncatedNote}>{note}</span>
                                </Tooltip>
                            ) : (
                                <Button
                                    variant="tertiary"
                                    size="s"
                                    iconOnly
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        handleOpenNoteModal(row.original.id);
                                    }}
                                    aria-label="Add review"
                                >
                                    <span className="material-symbols-rounded">add_comment</span>
                                </Button>
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'spacer',
                size: 0,
                minSize: 0,
                enableResizing: false,
                header: () => null,
                cell: () => null,
            },
            {
                id: 'actions',
                header: () => null,
                size: 48,
                minSize: 48,
                maxSize: 48,
                enableResizing: false,
                enableSorting: false,
                cell: ({ row }) => (
                    <RowContextMenu
                        actions={[
                            {
                                label: 'Facility management',
                                icon: 'door_front',
                                onClick: () => { /* Open room management */ },
                            },
                            {
                                label: row.original.supervisorNote ? 'Edit review' : 'Add review',
                                icon: 'add_comment',
                                onClick: () => handleOpenNoteModal(row.original.id),
                            },
                            ...(row.original.supervisorNote ? [{
                                label: 'Delete review',
                                icon: 'delete',
                                onClick: () => { /* Delete note */ },
                                destructive: true,
                            }] : []),
                        ]}
                    />
                ),
            },
        ],
        [displayMode, badgeTextMode, dimBreadcrumbs, tableFontWeight, handleOpenNoteModal]
    );



    const emptyState = (
        <EmptyStateMessage
            title="No results found"
            message="Try adjusting your search or filter settings"
        />
    );

    return (
        <>
            <div style={{ display: 'contents', '--table-font-weight': tableFontWeight === 'regular' ? 'var(--font-weight-regular)' : 'var(--font-weight-medium)' } as React.CSSProperties}>
                <DataTable
                    data={loadedData}
                    columns={columns}
                    enableRowSelection
                    rowSelection={rowSelection}
                    onRowSelectionChange={handleRowSelectionChange}
                    getRowId={(row) => row.id}
                    totalCount={totalCount}
                    isLoading={isLoading}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={() => setPanelOpen(true)}
                    initialSorting={[{ id: 'scheduled', desc: true }]}
                    emptyState={emptyState}
                />
            </div>
            {selectedRows.size > 0 && (
                <BulkActionFooter
                    selectedCount={selectedRows.size}
                    actionLabel={isEditMode ? 'Edit review' : 'Add review'}
                    actionIcon={isEditMode ? 'edit_note' : 'add_comment'}
                    onAction={() => {
                        setModalState({
                            isOpen: true,
                            selectedIds: Array.from(selectedRows),
                        });
                    }}
                    onClear={() => {
                        setSelectedRows(new Set());
                        setDetailRecord(null);
                    }}
                />
            )}
        </>
    );
};
