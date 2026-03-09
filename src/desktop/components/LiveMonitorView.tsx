import { useMemo, useCallback, useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { ColumnDef } from '@tanstack/react-table';
import { desktopFilterAtom } from '../atoms';
import { LiveCheckRow } from '../types';
import { DataTable } from './DataTable';
import { RowContextMenu } from './RowContextMenu';
import { StatusBadge, StatusBadgeType } from './StatusBadge';
import {
    TOTAL_LIVE_RECORDS,
    loadEnhancedLivePage as loadLiveChecksPage
} from '../../desktop-enhanced/data/mockData';
import { COLUMN_WIDTHS } from './tableConstants';
import { TimestampCell } from './TimestampCell';
import styles from './DataTable.module.css';

export const LiveMonitorView = () => {
    const filter = useAtomValue(desktopFilterAtom);

    // Pagination State
    const [loadedData, setLoadedData] = useState<LiveCheckRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(0);

    // Initial load and filter reset
    useEffect(() => {
        setIsLoading(true);
        setLoadedData([]);
        setCursor(0);
        void loadLiveChecksPage(0, 50, filter).then(({ data, nextCursor }) => {
            setLoadedData(data);
            setCursor(nextCursor ?? 0);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [filter]);

    const handleLoadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        void loadLiveChecksPage(cursor, 50, filter).then(({ data, nextCursor }) => {
            setLoadedData((prev) => [...prev, ...data]);
            setCursor(nextCursor ?? cursor);
            setHasMore(nextCursor !== null);
            setIsLoading(false);
        });
    }, [cursor, isLoading, hasMore, filter]);

    // Filter and sort loaded data
    const liveRows = useMemo(() => {
        const rows = [...loadedData];

        // Search is handled by the data loader


        // Sort by Schedule (Status) -> Location -> Risk
        rows.sort((a, b) => {
            // 1. Status Priority: Overdue > Due > Upcoming
            const statusOrder: Record<string, number> = { overdue: 0, due: 1, upcoming: 2 };
            const statusDiff = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99);
            if (statusDiff !== 0) return statusDiff;

            // 2. Location (Group -> Unit -> Room)
            const locA = `${a.group} ${a.unit} ${a.location}`;
            const locB = `${b.group} ${b.unit} ${b.location}`;
            const locDiff = locA.localeCompare(locB);
            if (locDiff !== 0) return locDiff;

            // 3. High Risk to top (if all else equal)
            if (a.hasHighRisk && !b.hasHighRisk) return -1;
            if (!a.hasHighRisk && b.hasHighRisk) return 1;

            return 0;
        });

        return rows;
    }, [loadedData]);

    const columns: ColumnDef<LiveCheckRow>[] = useMemo(
        () => [
            // 1. Resident column with hyperlink and alert icon
            {
                id: 'resident',
                header: 'Resident',
                ...COLUMN_WIDTHS.RESIDENT,
                accessorFn: (row) => row.residents.map((r) => r.name).join(', '),
                cell: ({ row }) => (
                    <div className={styles.residentCell}>
                        <a
                            href="#"
                            className={styles.linkText}
                            onClick={(e) => e.preventDefault()}
                        >
                            {row.original.residents.map((r) => r.name).join(', ')}
                        </a>
                        {row.original.hasHighRisk && (
                            <span
                                className={`material-symbols-rounded ${styles.alertIconInline}`}
                                title={row.original.riskType || 'Special Status'}
                            >
                                warning
                            </span>
                        )}
                    </div>
                ),
            },
            // 2. Merged Location column (Group > Unit > Room)
            {
                id: 'location',
                header: 'Location',
                ...COLUMN_WIDTHS.MERGED_LOCATION,
                accessorFn: (row) => `${row.group} ${row.unit} ${row.location}`,
                cell: ({ row }) => (
                    <div className={styles.locationCell}>
                        <span>{row.original.group}</span>
                        <span className={`material-symbols-rounded ${styles.nextIcon}`}>navigate_next</span>
                        <span>{row.original.unit}</span>
                        <span className={`material-symbols-rounded ${styles.nextIcon}`}>navigate_next</span>
                        <span>{row.original.location}</span>
                    </div>
                ),
            },
            // 5. Scheduled column
            {
                id: 'scheduled',
                header: 'Scheduled',
                ...COLUMN_WIDTHS.TIMESTAMP,
                accessorFn: (row) => row.lastCheckTime || '',
                cell: ({ row }) => (
                    <TimestampCell isoString={row.original.lastCheckTime} />
                ),
            },
            // 6. Status column
            {
                id: 'status',
                header: 'Status',
                ...COLUMN_WIDTHS.STATUS,
                accessorKey: 'status',
                cell: ({ row }) => {
                    return (
                        <StatusBadge status={row.original.status as StatusBadgeType} />
                    );
                },
            },
            // Spacer to push remaining columns to the right
            {
                id: 'spacer',
                size: 0,
                minSize: 0,
                enableResizing: false,
                header: () => null,
                cell: () => null,
            },
            // Actions column (pinned right)
            {
                id: 'actions',
                header: () => (
                    <div className={styles.checkboxCell}>
                        <span className={`material-symbols-rounded ${styles.actionHeaderIcon}`}>
                            more_vert
                        </span>
                    </div>
                ),
                ...COLUMN_WIDTHS.ACTIONS,
                enableSorting: false,
                cell: () => (
                    <RowContextMenu
                        actions={[
                            {
                                label: 'View resident',
                                icon: 'person',
                                onClick: () => { /* View resident */ },
                            },
                            {
                                label: 'Facility management',
                                icon: 'door_front',
                                onClick: () => { /* Manage room */ },
                            }
                        ]}
                    />
                ),
            },
        ],
        []
    );

    return (
        <DataTable
            data={liveRows}
            columns={columns}
            getRowId={(row) => row.id}
            totalCount={TOTAL_LIVE_RECORDS} // In a real app, this would come from the API Response
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onRowClick={undefined}
        />
    );
};
