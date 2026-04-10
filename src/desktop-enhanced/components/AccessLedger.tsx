import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    portalResultsAtom,
    isPortalActionExecutingAtom,
    portalInspectedRecordAtom,
    portalSelectedCountAtom,
    portalDensityModeAtom,
    portalLedgerHeaderVisibleAtom,
    portalLedgerFooterVisibleAtom,
    portalLedgerSummaryBadgesVisibleAtom,
} from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { TriggeredSearch } from '../../components/TriggeredSearch';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToastAtom } from '../../data/toastAtoms';
import { useTerminology } from '../hooks/useTerminology';
import { applyPortalStatusChange } from '../utils/portalAccess';
import styles from './AccessLedger.module.css';
type AccessAction = 'grant' | 'revoke';

const CASE_TYPE_OPTIONS = [
    { value: 'all', label: 'All types' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Criminal', label: 'Criminal' },
    { value: 'Juvenile', label: 'Juvenile' },
];

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';

export const AccessLedger: React.FC = () => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);
    const terminology = useTerminology();
    const densityMode = useAtomValue(portalDensityModeAtom);
    const showResultsHeader = useAtomValue(portalLedgerHeaderVisibleAtom);
    const showResultsFooter = useAtomValue(portalLedgerFooterVisibleAtom);
    const showSummaryBadges = useAtomValue(portalLedgerSummaryBadgesVisibleAtom);

    // Detail panel atoms — shared with app shell
    const setInspectedRecord = useSetAtom(portalInspectedRecordAtom);
    const setPortalSelectedCount = useSetAtom(portalSelectedCountAtom);

    // Search state
    const [localQuery, setLocalQuery] = useState('');
    const [searchTrigger, setSearchTrigger] = useState('');

    // Filter state — always available
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    // Selection & modal state
    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isActionConfirmOpen, setIsActionConfirmOpen] = useState(false);
    const [pendingActionIds, setPendingActionIds] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<AccessAction>('revoke');

    // Sticky search results
    const [visibleResults, setVisibleResults] = useState<PortalAccessRecord[]>([]);

    // ── Sync selected count to atom for the app shell ──
    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;

    useEffect(() => {
        setPortalSelectedCount(selectedCount);
    }, [selectedCount, setPortalSelectedCount]);

    // ── Clean up atoms on unmount ──
    useEffect(() => {
        return () => {
            setInspectedRecord(null);
            setPortalSelectedCount(0);
        };
    }, [setInspectedRecord, setPortalSelectedCount]);

    // ── Search: unified across email, case number, case name, participant ──
    const handleSearch = useCallback((val: string) => {
        setSearchTrigger(val);
        setStatusFilter('all');
        setTypeFilter('all');
        setSelectedIds({});
        setInspectedRecord(null);

        const q = val.toLowerCase();
        const matches = results.filter(r =>
            r.email.toLowerCase().includes(q) ||
            r.caseNumber.toLowerCase().includes(q) ||
            r.caseName.toLowerCase().includes(q) ||
            r.participantRole.toLowerCase().includes(q)
        );
        setVisibleResults(matches);
    }, [results, setInspectedRecord]);

    // ── Filters: compose on top of sticky results ──
    const finalResults = useMemo(() => {
        let current = visibleResults;

        if (statusFilter !== 'all') {
            current = current.filter(r => r.status === statusFilter);
        }
        if (typeFilter !== 'all') {
            current = current.filter(r => r.caseType === typeFilter);
        }
        return current;
    }, [visibleResults, statusFilter, typeFilter]);

    // ── Stats: computed from sticky results (pre-filter) ──
    const stats = useMemo(() => {
        const active = visibleResults.filter(r => r.status === 'Active').length;
        const inactive = visibleResults.filter(r => r.status === 'Inactive').length;
        return { total: visibleResults.length, active, inactive };
    }, [visibleResults]);

    const isFiltered = statusFilter !== 'all' || typeFilter !== 'all';

    const handleResetFilters = () => {
        setStatusFilter('all');
        setTypeFilter('all');
    };

    // ── Revoke flow ──
    const handleAccessChange = async () => {
        const ids = pendingActionIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        const count = ids.length;
        const nextStatus = pendingAction === 'revoke' ? 'Inactive' : 'Active';

        await new Promise(r => setTimeout(r, 1200));

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? applyPortalStatusChange(r, nextStatus) : r
        ));
        setVisibleResults(prev => prev.map(r =>
            ids.includes(r.id) ? applyPortalStatusChange(r, nextStatus) : r
        ));

        setIsExecuting(false);
        setPendingActionIds([]);
        setSelectedIds(prev => {
            const next = { ...prev };
            ids.forEach(id => delete next[id]);
            return next;
        });

        addToast({
            title: pendingAction === 'revoke' ? 'Access revoked' : 'Access granted',
            message: `${pendingAction === 'revoke' ? 'Removed' : 'Granted'} portal access for ${count} record${count > 1 ? 's' : ''}.`,
            icon: pendingAction === 'revoke' ? 'no_accounts' : 'person_add',
            variant: 'success'
        });
    };

    const openActionConfirm = (records: PortalAccessRecord[]) => {
        const ids = records.map(record => record.id);
        if (ids.length === 0) return;
        setPendingActionIds(ids);
        setPendingAction(records[0]?.status === 'Active' ? 'revoke' : 'grant');
        setIsActionConfirmOpen(true);
    };

    const openBulkActionConfirm = () => {
        const records = finalResults.filter(record => selectedIds[record.id]);
        openActionConfirm(records);
    };

    const openSingleActionConfirm = (record: PortalAccessRecord) => {
        openActionConfirm([record]);
    };

    // ── Row selection change → update inspected record for detail panel ──
    const handleSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>> = useCallback((updater) => {
        setSelectedIds(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            const activeIds = Object.keys(next).filter(k => next[k]);

            // Single selection → inspect that record in detail panel
            if (activeIds.length === 1) {
                const record = finalResults.find(r => r.id === activeIds[0]) || visibleResults.find(r => r.id === activeIds[0]);
                setInspectedRecord(record || null);
            } else {
                setInspectedRecord(null);
            }

            return next;
        });
    }, [finalResults, visibleResults, setInspectedRecord]);

    // ── Columns: Case | Email | Status | ... ──
    const columns: ColumnDef<PortalAccessRecord, unknown>[] = useMemo(() => [
        {
            accessorKey: 'caseNumber',
            header: 'Case Number',
            size: 150,
            minSize: 120,
        },
        {
            accessorKey: 'caseName',
            header: 'Case Name',
            size: 260,
            minSize: 200,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 220,
            minSize: 160,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        {
            accessorKey: 'status',
            header: terminology.columnHeader,
            size: 154,
            minSize: 154,
            cell: ({ getValue }) => {
                const val = getValue() as 'Active' | 'Inactive';
                if (!val) return null;
                return (
                    <div className={styles.badge} data-status={val}>
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>
                            {val === 'Active' ? terminology.activeIcon : terminology.inactiveIcon}
                        </span>
                        <span className={styles.badgeLabel}>{terminology.getStatusLabel(val)}</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'caseType',
            header: 'Type',
            size: 100,
            minSize: 80,
        },
        {
            accessorKey: 'participantRole',
            header: 'Participant',
            size: 220,
            minSize: 160,
        },
        {
            accessorKey: 'accessType',
            header: 'Access',
            size: 130,
            minSize: 100,
        },
    ], [terminology]);

    const selectedRecords = useMemo(
        () => finalResults.filter(record => selectedIds[record.id]),
        [finalResults, selectedIds]
    );
    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const statuses = new Set(selectedRecords.map(record => record.status));
        return statuses.size > 1;
    }, [selectedCount, selectedRecords]);
    const selectedAction: AccessAction = selectedRecords[0]?.status === 'Active' ? 'revoke' : 'grant';
    const selectedActionLabel = selectedAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const selectedActionIcon = selectedAction === 'revoke' ? 'no_accounts' : 'person_add';
    const pendingCount = pendingActionIds.length;
    const pendingActionLabel = pendingAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const pendingActionVerb = pendingAction === 'revoke' ? 'revoke' : 'grant';
    const pendingActionIcon = pendingAction === 'revoke' ? 'no_accounts' : 'person_add';
    const resultCountLabel = `Showing ${finalResults.length.toLocaleString()} of ${stats.total.toLocaleString()} results`;
    const pendingRecords = useMemo(
        () => pendingActionIds
            .map((id) => results.find((record) => record.id === id))
            .filter((record): record is PortalAccessRecord => !!record),
        [pendingActionIds, results]
    );
    const pendingDisplayNames = useMemo(
        () => pendingRecords.map((record) => record.participantRole.trim() || renderEmailValue(record.email)),
        [pendingRecords]
    );
    const visiblePendingNames = pendingDisplayNames.slice(0, 4);
    const remainingPendingNames = pendingDisplayNames.length - visiblePendingNames.length;

    const renderResultsChrome = (position: 'header' | 'footer') => (
        <div
            className={`${styles.resultsChrome} ${position === 'footer' ? styles.resultsChromeFooter : ''}`}
        >
            <div className={styles.resultsChromeMeta}>
                <span className={styles.resultCount}>{resultCountLabel}</span>
            </div>
            {showSummaryBadges && (
                <div className={styles.resultsChromeSummary}>
                    <div className={styles.badge} data-status="Active">
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>{terminology.activeIcon}</span>
                        <span className={styles.badgeLabel}>{stats.active} {terminology.activeLabel.toLowerCase()}</span>
                    </div>
                    <div className={styles.badge} data-status="Inactive">
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>{terminology.inactiveIcon}</span>
                        <span className={styles.badgeLabel}>{stats.inactive} {terminology.inactiveLabel.toLowerCase()}</span>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.view}>
            {/* ── Row 1: Toolbar — search + filters + panel toggle ── */}
            <div className={styles.toolbar}>
                <div className={styles.searchBar}>
                    <TriggeredSearch
                        value={localQuery}
                        onChange={setLocalQuery}
                        onSearch={handleSearch}
                        placeholder="Search email, case, or name..."
                    />
                </div>

                <div className={styles.filters}>
                    {isFiltered && (
                        <Button
                            variant="tertiary"
                            size="s"
                            onClick={handleResetFilters}
                            className={styles.resetButton}
                        >
                            Reset filters
                        </Button>
                    )}
                    <FilterSelect
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        placeholder="All statuses"
                        options={terminology.statusOptions}
                        onClear={() => setStatusFilter('all')}
                        isCustomized={statusFilter !== 'all'}
                        disabled={!searchTrigger}
                    />
                    <FilterSelect
                        value={typeFilter}
                        onValueChange={setTypeFilter}
                        placeholder="All types"
                        options={CASE_TYPE_OPTIONS}
                        onClear={() => setTypeFilter('all')}
                        isCustomized={typeFilter !== 'all'}
                        disabled={!searchTrigger}
                    />
                </div>
            </div>

            {searchTrigger && showResultsHeader && renderResultsChrome('header')}

            {/* ── Main content: table or empty state ── */}
            <div className={styles.tableWrapper}>
                {!searchTrigger ? (
                    <div className={styles.empty}>
                        <span className="material-symbols-rounded">manage_search</span>
                        <p className={styles.emptyTitle}>Access Ledger</p>
                        <p className={styles.emptyHint}>
                            Search by email address, case number, participant name, or case title to find portal access records.
                        </p>
                    </div>
                ) : (
                    <PortalDataTable
                        data={finalResults}
                        columns={columns}
                        densityMode={densityMode}
                        rowSelection={selectedIds}
                        onRowSelectionChange={handleSelectionChange}
                        onRevokeRow={openSingleActionConfirm}
                        getRowAction={(row) => row.status === 'Active'
                            ? {
                                label: 'Revoke access',
                                icon: 'no_accounts',
                                destructive: true,
                                variant: 'secondary',
                                onClick: () => openSingleActionConfirm(row),
                            }
                            : {
                                label: 'Grant access',
                                icon: 'person_add',
                                variant: 'primary',
                                onClick: () => openSingleActionConfirm(row),
                            }}
                        isLoading={isExecuting && finalResults.length === 0}
                        emptyState={
                            <div className={styles.empty}>
                                <span className="material-symbols-rounded">search_off</span>
                                <p className={styles.emptyHint}>No records match your search and filters.</p>
                            </div>
                        }
                    />
                )}
            </div>

            {searchTrigger && showResultsFooter && renderResultsChrome('footer')}

            {/* ── Bulk action footer ── */}
            {selectedCount > 0 && densityMode !== 'quick-actions' && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={openBulkActionConfirm}
                    onClear={() => {
                        setSelectedIds({});
                        setInspectedRecord(null);
                    }}
                    actionLabel={selectedActionLabel}
                    actionIcon={selectedActionIcon}
                    disabledMessage={isMixedSelection ? 'No valid actions' : undefined}
                />
            )}

            {/* ── Revoke confirmation modal ── */}
            <Modal
                isOpen={isActionConfirmOpen}
                onClose={() => setIsActionConfirmOpen(false)}
                title={pendingActionLabel}
                width="360px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>{pendingActionLabel}</div>
                    <Button
                        variant="tertiary"
                        size="s"
                        iconOnly
                        onClick={() => setIsActionConfirmOpen(false)}
                        disabled={isExecuting}
                    >
                        <span className="material-symbols-rounded">close</span>
                    </Button>
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
                        {pendingDisplayNames.length > 0 && (
                            <div className={styles.affectedRecords}>
                                <div className={styles.affectedRecordsLabel}>This will update access for:</div>
                                <div className={styles.affectedRecordsList}>
                                    {visiblePendingNames.map((name) => (
                                        <div key={name} className={styles.affectedRecordName}>{name}</div>
                                    ))}
                                    {remainingPendingNames > 0 && (
                                        <div className={styles.affectedRecordMore}>
                                            +{remainingPendingNames} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
