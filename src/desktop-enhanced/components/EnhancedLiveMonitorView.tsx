// src/desktop-enhanced/components/EnhancedLiveMonitorView.tsx
import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { ColumnDef, RowSelectionState, Updater } from '@tanstack/react-table';
import { desktopFilterAtom, selectedLiveRowsAtom, activeDetailRecordAtom, residentDisplayModeAtom, residentBadgeTextAtom, isDetailPanelOpenAtom, dimLocationBreadcrumbsAtom, tableFontWeightAtom, isNoResultsAtom, skeletonForcedAtom } from '../../desktop/atoms';
import { useMinDurationSkeleton } from '../../hooks/useMinDurationSkeleton';
import { LiveCheckRow } from '../../desktop/types';
import { DataTable } from '../../desktop/components/DataTable';
import { EmptyStateMessage } from '../../components/EmptyStateMessage';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { ResidentChip } from '../../desktop/components/ResidentChip';
import { ResidentStatusGroup } from '../../desktop/components/ResidentStatusGroup';
import { loadEnhancedLivePage } from '../data/mockData';
import { COLUMN_WIDTHS } from '../../desktop/components/tableConstants';
import { TimestampCell } from '../../desktop/components/TimestampCell';
import styles from '../../desktop/components/DataTable.module.css';

export const EnhancedLiveMonitorView = () => {
    const filter = useAtomValue(desktopFilterAtom);
    const forced = useAtomValue(skeletonForcedAtom);
    const residentDisplayMode = useAtomValue(residentDisplayModeAtom);
    const badgeTextMode = useAtomValue(residentBadgeTextAtom);
    const dimBreadcrumbs = useAtomValue(dimLocationBreadcrumbsAtom);
    const tableFontWeight = useAtomValue(tableFontWeightAtom);
    // Pagination State
    const [loadedData, setLoadedData] = useState<LiveCheckRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const setIsNoResults = useSetAtom(isNoResultsAtom);

    const isFirstLoadRef = useRef(true);
    const [skeletonMinMs, setSkeletonMinMs] = useState(1000);
    const [showHeaderSkeleton, setShowHeaderSkeleton] = useState(true);

    // Initial load and filter reset
    useEffect(() => {
        const isViewChange = isFirstLoadRef.current;
        isFirstLoadRef.current = false;

        const useMin = isViewChange || forced;
        setSkeletonMinMs(useMin ? 1000 : 0);
        setShowHeaderSkeleton(useMin);

        setIsLoading(true);
        setLoadedData([]);
        setCursor(0);
        void loadEnhancedLivePage(0, 50, filter).then(({ data, nextCursor, totalCount }) => {
            setLoadedData(data);
            setCursor(nextCursor ?? 0);
            setHasMore(nextCursor !== null);
            setTotalCount(totalCount);
            setIsLoading(false);

            // Sync no results state
            setIsNoResults(data.length === 0);
        });
    }, [filter, forced, setIsNoResults]);

    const showSkeleton = useMinDurationSkeleton(isLoading, skeletonMinMs);

    const handleLoadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        void loadEnhancedLivePage(cursor, 50, filter).then(({ data, nextCursor }) => {
            setLoadedData((prev) => [...prev, ...data]);
            setCursor(nextCursor ?? cursor);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [cursor, isLoading, hasMore, filter]);

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [

            {
                id: 'resident',
                header: 'Resident',
                size: 340,
                minSize: 300,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => {
                    return (
                        <div className={styles.residentCell}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-0p5)', width: '100%' }}>
                                {row.original.residents.map((r, i) => {
                                    if (residentDisplayMode === 'chip') {
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
                                            {residentDisplayMode === 'left-badge' ? (
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
                cell: ({ row }) => {


                    return (
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
                    );
                },
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
                    const priority: Record<string, number> = { overdue: 0, due: 1, upcoming: 2 };
                    const a = priority[rowA.original.status] ?? 3;
                    const b = priority[rowB.original.status] ?? 3;
                    if (a !== b) return a - b;
                    const timeA = new Date(rowA.original.originalCheck?.dueDate || 0).getTime();
                    const timeB = new Date(rowB.original.originalCheck?.dueDate || 0).getTime();
                    return timeA - timeB;
                },
                cell: ({ row }) => {
                    const count = row.original.missedCheckCount;
                    const label = (count && count > 1) ? `Missed (${count})` : undefined;
                    // Top align with margin for single resident centering effect

                    return (
                        <div style={{
                            marginLeft: 'calc(var(--spacing-0p5) * -1)',
                            display: 'flex',
                            alignItems: 'center',
                            height: '100%',
                        }}>
                            <StatusBadge
                                status={row.original.status as StatusBadgeType}
                                label={label}
                                iconOnly={false}
                            />
                        </div>
                    );
                },
            },
            {
                id: 'scheduled',
                header: 'Scheduled',
                size: 180,
                minSize: 160,
                accessorFn: (row) => row.originalCheck?.dueDate || '',
                cell: ({ row }) => (
                    <TimestampCell isoString={row.original.originalCheck?.dueDate} />
                ),
            },

        ],
        [residentDisplayMode, badgeTextMode, dimBreadcrumbs, tableFontWeight]
    );

    const [selectedRows, setSelectedRows] = useAtom(selectedLiveRowsAtom);
    const setDetailRecord = useSetAtom(activeDetailRecordAtom);
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);

    const rowSelection = useMemo(() => {
        const selection: Record<string, boolean> = {};
        selectedRows.forEach(id => selection[id] = true);
        return selection;
    }, [selectedRows]);

    const handleRowSelectionChange = useCallback(
        (updaterOrValue: Updater<RowSelectionState>) => {
            const newSelection = (typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue) as Record<string, boolean>;
            const newSet = new Set(Object.keys(newSelection).filter((k) => newSelection[k]));
            setSelectedRows(newSet);

            // If selection becomes empty or multiple, clear active single record
            if (newSet.size !== 1) {
                setDetailRecord(null);
            }
        },
        [rowSelection, setSelectedRows, setDetailRecord]
    );

    // Sync active record with selection and loaded data (matching Historical Review View pattern)
    useEffect(() => {
        if (selectedRows.size === 1) {
            const id = Array.from(selectedRows)[0];
            const row = loadedData.find(r => r.id === id);
            if (row) {
                setDetailRecord({
                    id: row.id,
                    correlationGuid: row.originalCheck?.correlationGuid,
                    source: 'live',
                    residents: row.residents,
                    residentName: row.residents.map(r => r.name).join(', '),
                    location: row.location,
                    status: row.status,
                    scheduledStartTime: row.originalCheck?.scheduledStartTime,
                    scheduledEndTime: row.originalCheck?.scheduledEndTime,
                    completedTime: row.originalCheck?.completedTime,
                    missedTime: row.originalCheck?.missedTime,
                    timeScheduled: row.originalCheck?.dueDate || '',
                    timeActual: null,
                    officerName: '',
                    group: row.group,
                    unit: row.unit,
                    roomIdMethod: row.originalCheck?.roomIdMethod,
                });
            } else {
                setDetailRecord(null);
                setSelectedRows(new Set());
            }
        } else {
            setDetailRecord(null);
        }
    }, [selectedRows, loadedData, setDetailRecord, setSelectedRows]);

    const handleRowClick = useCallback((row: LiveCheckRow) => {
        setSelectedRows((_prev) => {
            if (_prev.has(row.id) && _prev.size === 1) return new Set();
            return new Set([row.id]);
        });
    }, [setSelectedRows]);


    const emptyState = (
        <EmptyStateMessage
            title="No results found"
            message="Try adjusting your search or filter settings"
        />
    );

    return (
        <div style={{ display: 'contents', '--table-font-weight': tableFontWeight === 'regular' ? 'var(--font-weight-regular)' : 'var(--font-weight-medium)' } as React.CSSProperties}>
            <DataTable
                data={loadedData}
                columns={columns}
                getRowId={(row) => row.id}
                totalCount={totalCount}
                isLoading={isLoading}
                showSkeleton={showSkeleton}
                showHeaderSkeleton={showHeaderSkeleton}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                enableRowSelection={true}
                rowSelection={rowSelection}
                onRowSelectionChange={handleRowSelectionChange}
                onRowClick={handleRowClick}
                onRowDoubleClick={() => setPanelOpen(true)}
                initialSorting={[{ id: 'scheduled', desc: false }]}
                emptyState={emptyState}
            />
        </div>
    );
};
