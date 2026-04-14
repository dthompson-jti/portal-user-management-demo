import React, { useState, useMemo, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom, portalDensityModeAtom } from '../atoms';
import { useTerminology } from '../hooks/useTerminology';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef } from '@tanstack/react-table';
import { TriggeredSearch } from '../../components/TriggeredSearch';
import { InstantSearch } from '../../components/InstantSearch';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { addToastAtom } from '../../data/toastAtoms';
import { activePageAtom } from '../../data/activePageAtom';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { getResultCountBucket, trackEvent } from '../../analytics';
import styles from './PortalEmailSearch.module.css'; // Reusing CSS

type AccessAction = 'grant' | 'revoke';
type PortalDisplayRecord = PortalAccessRecord & {
    referenceId: string;
    lastModifiedBy: string;
    lastAccessed: string;
    accessSource: string;
    inviteStatus: string;
    accountState: string;
    reviewFlag: string;
};

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';
const formatAmbiguousDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return isoDate;
    return `${month}/${day}/${year.slice(-2)}`;
};
const deriveReferenceId = (record: PortalAccessRecord) => {
    const caseTail = record.caseNumber.replace(/[^0-9]/g, '').slice(-6);
    const rowTail = record.id.replace(/[^0-9]/g, '').padStart(3, '0').slice(-3);
    return `REF-${caseTail}-${rowTail}`;
};
const deriveLastModifiedBy = (record: PortalAccessRecord) => {
    if (record.author === 'Registry officer') return 'Registry Officer';
    if (record.status === 'Inactive') return 'Portal Support';
    return 'Case Admin';
};
const deriveAccessSource = (record: PortalAccessRecord) => {
    if (record.accessType === 'Delegated access') return 'Case assignment';
    if (record.author === 'Registry officer') return 'Registry invite';
    return 'Self service';
};
const deriveInviteStatus = (record: PortalAccessRecord) => {
    if (record.status === 'Active') return 'Accepted';
    if (record.dateRevoked) return 'Expired';
    return 'Sent';
};
const deriveAccountState = (record: PortalAccessRecord) => {
    if (record.status === 'Inactive') return 'Locked';
    if (record.email.includes('outlook') || record.email.includes('webmail')) return 'Pending verification';
    return 'Enabled';
};
const deriveReviewFlag = (record: PortalAccessRecord) => {
    if (record.status === 'Inactive' && record.accessType === 'Delegated access') return 'Supervisor review';
    if (record.accessType === 'Delegated access') return 'Check identity';
    return 'None';
};
const deriveLastAccessed = (record: PortalAccessRecord) => {
    const source = record.dateRevoked ?? record.dateGranted;
    const [year, month, day] = source.split('-').map(Number);
    if (!year || !month || !day) return source;
    const offset = Number.parseInt(record.id.replace(/[^0-9]/g, ''), 10) % 9;
    const adjustedDay = Math.min(day + offset, 28);
    return `${String(month).padStart(2, '0')}/${String(adjustedDay).padStart(2, '0')}/${String(year).slice(-2)}`;
};
const enrichPortalRecord = (record: PortalAccessRecord): PortalDisplayRecord => ({
    ...record,
    referenceId: deriveReferenceId(record),
    lastModifiedBy: deriveLastModifiedBy(record),
    lastAccessed: deriveLastAccessed(record),
    accessSource: deriveAccessSource(record),
    inviteStatus: deriveInviteStatus(record),
    accountState: deriveAccountState(record),
    reviewFlag: deriveReviewFlag(record),
});
const renderStatusValue = (label: string) => (
    <span className={styles.statusText}>
        {label}
    </span>
);
const renderStatusEdge = (status: 'Active' | 'Inactive') => (
    <div className={styles.statusEdgeCell}>
        <span className={styles.statusEdge} data-status={status} />
    </div>
);

interface PortalOmnisearchProps {
    mode?: 'email' | 'case';
    matchMode?: 'exact' | 'partial';
    resultLayout?: 'default' | 'email-first' | 'case-email';
}

export const PortalOmnisearch: React.FC<PortalOmnisearchProps> = ({
    mode,
    matchMode = 'exact',
    resultLayout = 'default',
}) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const densityMode = useAtomValue(portalDensityModeAtom);
    const addToast = useSetAtom(addToastAtom);
    const setActivePage = useSetAtom(activePageAtom);
    const terminology = useTerminology();
    const isEmailSearch = mode === 'email';
    
    // Search & Context State
    const [localQuery, setLocalQuery] = useState('');
    const [searchTrigger, setSearchTrigger] = useState('');
    const [queryContext, setQueryContext] = useState<'email' | 'case' | null>(null);
    const [isSearchPending, setIsSearchPending] = useState(false);

    // Filters & View State
    const [quickFilter, setQuickFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [groupBy, setGroupBy] = useState('none');

    // Row actions
    const [isActionConfirmOpen, setIsActionConfirmOpen] = useState(false);
    const [detailRecord, setDetailRecord] = useState<PortalDisplayRecord | null>(null);
    const [pendingActionIds, setPendingActionIds] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<AccessAction>('revoke');
    const [visibleResults, setVisibleResults] = useState<PortalAccessRecord[]>([]);

    const handleSearch = useCallback((val: string) => {
        setSearchTrigger(val);
        setQuickFilter(''); 
        setStatusFilter('all');
        setVisibleResults([]);
        setIsSearchPending(true);
        const q = val.trim().toLowerCase();

        // If mode is locked, use it; otherwise auto-detect from query
        let context:'email' | 'case' = mode ?? (q.includes('@') ? 'email' : 'case');
        setQueryContext(context);
        
        const matches = results.filter(r => {
            if (mode === 'email') {
                return matchMode === 'partial'
                    ? r.email.toLowerCase().includes(q)
                    : r.email.toLowerCase() === q;
            }

            if (mode === 'case') {
                return matchMode === 'partial'
                    ? r.caseNumber.toLowerCase().includes(q)
                    : r.caseNumber.toLowerCase() === q;
            }

            return (
                r.email.toLowerCase().includes(q) ||
                r.caseNumber.toLowerCase().includes(q) ||
                r.caseName.toLowerCase().includes(q)
            );
        });

        trackEvent('portal_search_executed', {
            match_mode: matchMode,
            query_context: context,
            query_length: q.length,
            result_bucket: getResultCountBucket(matches.length),
            result_count: matches.length,
            search_mode: mode ?? 'auto',
        });

        window.setTimeout(() => {
            setVisibleResults(matches);
            setIsSearchPending(false);
        }, 1000);
    }, [matchMode, mode, results]);

    const finalResults = useMemo(() => {
        let current = visibleResults;
        
        if (statusFilter !== 'all') {
            current = current.filter(r => r.status === statusFilter);
        }

        if (quickFilter) {
            const q = quickFilter.toLowerCase();
            current = current.filter(r => 
                r.caseNumber.toLowerCase().includes(q) || 
                r.caseName.toLowerCase().includes(q) ||
                r.participantRole.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q)
            );
        }

        return current;
    }, [visibleResults, quickFilter, statusFilter]);
    const displayResults = useMemo<PortalDisplayRecord[]>(
        () => finalResults.map(enrichPortalRecord),
        [finalResults]
    );

    const handleAccessChange = async () => {
        const ids = pendingActionIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        const nextStatus = pendingAction === 'revoke' ? 'Inactive' : 'Active';
        await new Promise(r => setTimeout(r, 1200));

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: nextStatus } : r
        ));

        setVisibleResults(prev => prev.map(r => 
            ids.includes(r.id) ? { ...r, status: nextStatus } : r
        ));

        trackEvent('portal_access_updated', {
            action: pendingAction,
            record_count: ids.length,
            result_context: queryContext ?? mode ?? 'unknown',
            resulting_status: nextStatus,
        });

        setIsExecuting(false);
        setPendingActionIds([]);
        
        addToast({
            title: pendingAction === 'revoke' ? 'Access removed' : 'Access granted',
            message: `Successfully ${pendingAction === 'revoke' ? 'removed' : 'granted'} portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: pendingAction === 'revoke' ? 'no_accounts' : 'person_add',
            variant: 'success'
        });
    };

    const openActionConfirm = useCallback((records: PortalAccessRecord[]) => {
        const ids = records.map(record => record.id);
        if (ids.length === 0) return;
        setPendingActionIds(ids);
        setPendingAction(records[0]?.status === 'Active' ? 'revoke' : 'grant');
        setIsActionConfirmOpen(true);
    }, []);
    const statusEdgeColumn: ColumnDef<PortalDisplayRecord, unknown> = {
        id: 'status-edge',
        header: () => null,
        size: 8,
        minSize: 8,
        maxSize: 8,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row }) => renderStatusEdge(row.original.status),
    };

    const caseColumns: ColumnDef<PortalDisplayRecord, unknown>[] = [
        statusEdgeColumn,
        {
            accessorKey: 'email',
            header: 'Email Address',
            size: 250,
            minSize: 200,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        { accessorKey: 'participantRole', header: 'Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Portal Role(s)', size: 150, minSize: 120 },
        { accessorKey: 'referenceId', header: 'Reference ID', size: 150, minSize: 130 },
        {
            accessorKey: 'dateGranted',
            header: 'Granted Date',
            size: 120,
            minSize: 108,
            cell: ({ getValue }) => formatAmbiguousDate(getValue() as string),
        },
        {
            accessorKey: 'author',
            header: 'Granted by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastModifiedBy',
            header: 'Last modified by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastAccessed',
            header: 'Last accessed',
            size: 120,
            minSize: 108,
        },
        { 
            accessorKey: 'status', 
            header: terminology.columnHeader,
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as 'Active' | 'Inactive';
                return val ? renderStatusValue(terminology.getStatusLabel(val)) : null;
            }
        },
    ];

    const emailColumns: ColumnDef<PortalDisplayRecord, unknown>[] = [
        statusEdgeColumn,
        { accessorKey: 'caseNumber', header: 'Case Number', size: 150, minSize: 120 },
        { accessorKey: 'caseName', header: 'Case Name', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        { accessorKey: 'referenceId', header: 'Reference ID', size: 150, minSize: 130 },
        {
            accessorKey: 'dateGranted',
            header: 'Granted Date',
            size: 120,
            minSize: 108,
            cell: ({ getValue }) => formatAmbiguousDate(getValue() as string),
        },
        {
            accessorKey: 'author',
            header: 'Granted by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastModifiedBy',
            header: 'Last modified by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastAccessed',
            header: 'Last accessed',
            size: 120,
            minSize: 108,
        },
        { 
            accessorKey: 'status', 
            header: terminology.columnHeader,
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as 'Active' | 'Inactive';
                return val ? renderStatusValue(terminology.getStatusLabel(val)) : null;
            }
        },
    ];

    const emailFirstColumns: ColumnDef<PortalDisplayRecord, unknown>[] = [
        statusEdgeColumn,
        {
            accessorKey: 'email',
            header: 'Email Address',
            size: 250,
            minSize: 220,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        { accessorKey: 'caseNumber', header: 'Case Number', size: 150, minSize: 120 },
        { accessorKey: 'caseName', header: 'Case Name', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        { accessorKey: 'referenceId', header: 'Reference ID', size: 150, minSize: 130 },
        {
            accessorKey: 'dateGranted',
            header: 'Granted Date',
            size: 120,
            minSize: 108,
            cell: ({ getValue }) => formatAmbiguousDate(getValue() as string),
        },
        {
            accessorKey: 'author',
            header: 'Granted by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastModifiedBy',
            header: 'Last modified by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastAccessed',
            header: 'Last accessed',
            size: 120,
            minSize: 108,
        },
        {
            accessorKey: 'status',
            header: terminology.columnHeader,
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as 'Active' | 'Inactive';
                return val ? renderStatusValue(terminology.getStatusLabel(val)) : null;
            }
        },
    ];

    const caseEmailColumns: ColumnDef<PortalDisplayRecord, unknown>[] = [
        statusEdgeColumn,
        { accessorKey: 'caseNumber', header: 'Case Number', size: 150, minSize: 120 },
        {
            accessorKey: 'email',
            header: 'Email Address',
            size: 250,
            minSize: 220,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        { accessorKey: 'caseName', header: 'Case Name', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        { accessorKey: 'referenceId', header: 'Reference ID', size: 150, minSize: 130 },
        {
            accessorKey: 'dateGranted',
            header: 'Granted Date',
            size: 120,
            minSize: 108,
            cell: ({ getValue }) => formatAmbiguousDate(getValue() as string),
        },
        {
            accessorKey: 'author',
            header: 'Granted by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastModifiedBy',
            header: 'Last modified by',
            size: 180,
            minSize: 150,
        },
        {
            accessorKey: 'lastAccessed',
            header: 'Last accessed',
            size: 120,
            minSize: 108,
        },
        {
            accessorKey: 'status',
            header: terminology.columnHeader,
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as 'Active' | 'Inactive';
                return val ? renderStatusValue(terminology.getStatusLabel(val)) : null;
            }
        },
    ];

    const activeColumns = (() => {
        if (mode === 'email' && resultLayout === 'email-first') {
            return emailFirstColumns;
        }

        if (mode === 'case' && resultLayout === 'case-email') {
            return caseEmailColumns;
        }

        return queryContext === 'case' ? caseColumns : emailColumns;
    })();
    const groupOptions = useMemo(() => {
        const options = new Map<string, { value: string; label: string }>();
        options.set('none', { value: 'none', label: 'No grouping' });

        activeColumns.forEach((column) => {
            const accessorKey = 'accessorKey' in column ? column.accessorKey : undefined;
            if (typeof accessorKey !== 'string') return;
            const headerLabel = typeof column.header === 'string'
                ? column.header
                : accessorKey;

            options.set(accessorKey, {
                value: accessorKey,
                label: `Group by ${headerLabel}`,
            });
        });

        return Array.from(options.values());
    }, [activeColumns]);
    const minSearchLength = matchMode === 'partial' ? 1 : 3;
    const pendingCount = pendingActionIds.length;
    const pendingActionLabel = pendingAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const pendingActionVerb = pendingAction === 'revoke' ? 'revoke' : 'grant';
    const pendingActionIcon = pendingAction === 'revoke' ? 'no_accounts' : 'person_add';
    const showResultControls = visibleResults.length > 0;
    const searchHeading = isEmailSearch ? 'Search by email' : 'Search by case';
    const searchCaption = isEmailSearch ? 'Use the full email address to pull records.' : 'Use the full case id to pull records.';
    const searchPlaceholder = searchHeading;
    const quickFilterPlaceholder = 'Find within Results';
    const resultCountLabel = `${finalResults.length} Record${finalResults.length === 1 ? '' : 's'}`;
    const cancelLabel = 'cancel';

    return (
        <div className={styles.view}>
            {/* Row 1: Triggered Search */}
            <div className={styles.triggeredSearchRow}>
                <div className={styles.searchIntro}>
                    <button
                        type="button"
                        className={styles.scenarioBack}
                        onClick={() => setActivePage('portal-home')}
                        tabIndex={-1}
                    >
                        All scenarios
                    </button>
                    <span className={styles.searchModeNote}>{isEmailSearch ? 'Search mode' : 'search mode'}</span>
                    <p className={styles.searchHeading}>{searchHeading}</p>
                    <p className={styles.searchCaption}>{searchCaption}</p>
                </div>
                <div className={styles.searchBar}>
                        <TriggeredSearch
                            value={localQuery}
                            onChange={setLocalQuery}
                            onSearch={(q) => void handleSearch(q)}
                            placeholder={searchPlaceholder}
                            minSearchLength={minSearchLength}
                        />
                </div>
            </div>

            {/* Row 2: Settings & Filters */}
            {showResultControls && (
                <div className={styles.quickFilterRow}>
                    <div className={styles.quickFilterLeft}>
                        <div className={styles.resultSummary}>{resultCountLabel}</div>
                        <div className={styles.quickFilterWrapper}>
                            <InstantSearch
                                value={quickFilter}
                                onChange={setQuickFilter}
                                placeholder={quickFilterPlaceholder}
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className={styles.quickFilterRight}>
                        <div className={styles.filterGroup}>
                            <FilterSelect
                                value={groupBy}
                                onValueChange={setGroupBy}
                                placeholder="Group by"
                                options={groupOptions}
                                onClear={() => setGroupBy('none')}
                                isCustomized={groupBy !== 'none'}
                            />
                            <FilterSelect
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                placeholder="All status"
                                options={terminology.statusOptions}
                                onClear={() => setStatusFilter('all')}
                                isCustomized={statusFilter !== 'all'}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.tableWrapper}>
                {!searchTrigger ? (
                    <div className={styles.empty}>
                        <span className="material-symbols-rounded">search</span>
                        <p className={styles.emptyTitle}>{searchHeading} to retrieve access records.</p>
                        <p className={styles.emptyHint}>{isEmailSearch ? 'Full matches only.' : 'Try a full case id first.'}</p>
                    </div>
                ) : isSearchPending ? (
                    <div className={styles.silentWait} />
                ) : (
                    <PortalDataTable 
                        data={displayResults} 
                        columns={activeColumns} 
                        onRevokeRow={(row) => openActionConfirm([row])}
                        onViewDetails={(row) => setDetailRecord(row)}
                        getRowAction={(row) => row.status === 'Active'
                            ? {
                                label: 'Revoke access',
                                icon: 'no_accounts',
                                destructive: true,
                                variant: 'secondary',
                                onClick: () => openActionConfirm([row]),
                            }
                            : {
                                label: 'Grant access',
                                icon: 'person_add',
                                variant: 'primary',
                                onClick: () => openActionConfirm([row]),
                            }}
                        densityMode={densityMode}
                        groupBy={groupBy}
                        isLoading={isExecuting && finalResults.length === 0}
                        showSelection={false}
                        hideHeaderControlsWhenEmpty={mode === 'email' || mode === 'case'}
                        emptyState={
                            <div className={styles.empty}>
                                <span className="material-symbols-rounded">search_off</span>
                                <p className={styles.emptyTitle}>No matching access Records</p>
                                <p className={styles.emptyHint}>{isEmailSearch ? 'Try another email.' : 'Try another case id.'}</p>
                            </div>
                        }
                    />
                )}
            </div>

            <Modal
                isOpen={isActionConfirmOpen}
                onClose={() => setIsActionConfirmOpen(false)}
                title={pendingActionLabel}
                width="360px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>{pendingActionLabel}</div>
                </Modal.Header>
                <Modal.Content>
                    <div className={styles.confirmBody}>
                        {pendingAction === 'revoke' && (
                            <div className={styles.warningBannerYellow}>
                                <span className={`material-symbols-rounded ${styles.warningBannerIconYellow}`}>warning</span>
                                <span>Access will be removed from the selected records. You can add access again later if needed.</span>
                            </div>
                        )}
                        <p className={styles.confirmText}>
                            Are you sure you want to {pendingActionVerb} portal access for <strong>{pendingCount} record{pendingCount > 1 ? 's' : ''}</strong>?
                        </p>
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        <Button
                            variant="primary"
                            size="m"
                            onClick={() => {
                                setIsActionConfirmOpen(false);
                                void handleAccessChange();
                            }}
                            loading={isExecuting}
                        >
                            <span className="material-symbols-rounded">{pendingActionIcon}</span>
                            {pendingActionLabel}
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="m" 
                            onClick={() => setIsActionConfirmOpen(false)}
                            disabled={isExecuting}
                        >
                            {cancelLabel}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal
                isOpen={!!detailRecord}
                onClose={() => setDetailRecord(null)}
                title="Access details"
                width="760px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>View details</div>
                </Modal.Header>
                <Modal.Content>
                    {detailRecord && (
                        <div className={styles.detailModal}>
                            <div className={styles.detailHero}>
                                <div className={styles.detailHeroMeta}>Record summary</div>
                                <div className={styles.detailHeroTitle}>
                                    {isEmailSearch ? detailRecord.email : detailRecord.caseNumber}
                                </div>
                                <div className={styles.detailHeroSub}>
                                    {isEmailSearch ? detailRecord.caseName : detailRecord.email}
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionTitle}>Current values</div>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Portal Access</span>
                                        <span className={styles.detailValue}>{terminology.getStatusLabel(detailRecord.status)}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Reference ID</span>
                                        <span className={styles.detailValue}>{detailRecord.referenceId}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Case Number</span>
                                        <span className={styles.detailValue}>{detailRecord.caseNumber}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Case Name</span>
                                        <span className={styles.detailValue}>{detailRecord.caseName}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Email Address</span>
                                        <span className={styles.detailValue}>{detailRecord.email}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Participant Role</span>
                                        <span className={styles.detailValue}>{detailRecord.participantRole}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Access Type</span>
                                        <span className={styles.detailValue}>{detailRecord.accessType}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Granted Date</span>
                                        <span className={styles.detailValue}>{formatAmbiguousDate(detailRecord.dateGranted)}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Granted by</span>
                                        <span className={styles.detailValue}>{detailRecord.author}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Last modified by</span>
                                        <span className={styles.detailValue}>{detailRecord.lastModifiedBy}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Last accessed</span>
                                        <span className={styles.detailValue}>{detailRecord.lastAccessed}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.detailSection}>
                                <div className={styles.detailSectionTitle}>Other system fields</div>
                                <div className={styles.detailGrid}>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Access source</span>
                                        <span className={styles.detailValue}>{detailRecord.accessSource}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Invite status</span>
                                        <span className={styles.detailValue}>{detailRecord.inviteStatus}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Account state</span>
                                        <span className={styles.detailValue}>{detailRecord.accountState}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Review flag</span>
                                        <span className={styles.detailValue}>{detailRecord.reviewFlag}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Shared with</span>
                                        <span className={styles.detailValue}>{detailRecord.sharedWith}</span>
                                    </div>
                                    <div className={styles.detailField}>
                                        <span className={styles.detailLabel}>Purpose</span>
                                        <span className={styles.detailValue}>{detailRecord.purpose}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        <Button variant="secondary" size="m" onClick={() => setDetailRecord(null)}>
                            done
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
