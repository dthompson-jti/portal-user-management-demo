import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom, portalInspectedRecordAtom, portalSelectedCountAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { TriggeredSearch } from '../../components/TriggeredSearch';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToastAtom } from '../../data/toastAtoms';
import styles from './AccessLedger.module.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const CASE_TYPE_OPTIONS = [
    { value: 'all', label: 'All types' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Criminal', label: 'Criminal' },
    { value: 'Juvenile', label: 'Juvenile' },
];

const ACCESS_TYPE_OPTIONS = [
    { value: 'all', label: 'All access' },
    { value: 'Direct access', label: 'Direct access' },
    { value: 'Delegated access', label: 'Delegated access' },
];

const STATUS_BADGE_CONFIG = {
    Active: { label: 'Portal access', icon: 'check_circle' },
    Inactive: { label: 'No Portal access', icon: 'block' },
} as const;

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';

export const AccessLedger: React.FC = () => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);

    // Detail panel atoms — shared with app shell
    const setInspectedRecord = useSetAtom(portalInspectedRecordAtom);
    const setPortalSelectedCount = useSetAtom(portalSelectedCountAtom);

    // Search state
    const [localQuery, setLocalQuery] = useState('');
    const [searchTrigger, setSearchTrigger] = useState('');

    // Filter state — always available
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [accessFilter, setAccessFilter] = useState('all');

    // Selection & modal state
    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
    const [pendingRevokeIds, setPendingRevokeIds] = useState<string[]>([]);

    // Sticky search results
    const [visibleResults, setVisibleResults] = useState<PortalAccessRecord[]>([]);

    // ── Sync selected count to atom for the app shell ──
    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;

    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const selectedRecords = finalResults.filter(r => selectedIds[r.id]);
        const statuses = new Set(selectedRecords.map(r => r.status));
        return statuses.size > 1;
    }, [selectedCount, selectedIds, finalResults]);

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
        setAccessFilter('all');
        setSelectedIds({});
        setInspectedRecord(null);

        const q = val.toLowerCase();
        const matches = results.filter(r =>
            r.email.toLowerCase().includes(q) ||
            r.caseNumber.toLowerCase().includes(q) ||
            r.caseName.toLowerCase().includes(q) ||
            r.participantRole.toLowerCase().includes(q) ||
            r.author.toLowerCase().includes(q)
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
        if (accessFilter !== 'all') {
            current = current.filter(r => r.accessType === accessFilter);
        }
        return current;
    }, [visibleResults, statusFilter, typeFilter, accessFilter]);

    // ── Stats: computed from sticky results (pre-filter) ──
    const stats = useMemo(() => {
        const active = visibleResults.filter(r => r.status === 'Active').length;
        const inactive = visibleResults.filter(r => r.status === 'Inactive').length;
        return { total: visibleResults.length, active, inactive };
    }, [visibleResults]);

    const isFiltered = statusFilter !== 'all' || typeFilter !== 'all' || accessFilter !== 'all';

    const handleResetFilters = () => {
        setStatusFilter('all');
        setTypeFilter('all');
        setAccessFilter('all');
    };

    // ── Revoke flow ──
    const handleRemoveAccess = async () => {
        const ids = pendingRevokeIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        const count = ids.length;

        await new Promise(r => setTimeout(r, 1200));

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: 'Inactive' as const } : r
        ));
        setVisibleResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: 'Inactive' as const } : r
        ));

        setIsExecuting(false);
        setPendingRevokeIds([]);
        setSelectedIds(prev => {
            const next = { ...prev };
            ids.forEach(id => delete next[id]);
            return next;
        });

        addToast({
            title: 'Access revoked',
            message: `Removed portal access for ${count} record${count > 1 ? 's' : ''}.`,
            icon: 'no_accounts',
            variant: 'success'
        });
    };

    const openBulkRevokeConfirm = () => {
        const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
        if (ids.length === 0) return;
        setPendingRevokeIds(ids);
        setIsRevokeConfirmOpen(true);
    };

    const openSingleRevokeConfirm = (record: PortalAccessRecord) => {
        setPendingRevokeIds([record.id]);
        setIsRevokeConfirmOpen(true);
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
            header: 'Status',
            size: 154,
            minSize: 154,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                if (!val) return null;
                const config = STATUS_BADGE_CONFIG[val as keyof typeof STATUS_BADGE_CONFIG];
                if (!config) return val;
                return (
                    <div className={styles.badge} data-status={val}>
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>{config.icon}</span>
                        <span className={styles.badgeLabel}>{config.label}</span>
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
    ], []);

    const pendingCount = pendingRevokeIds.length;

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
                        options={STATUS_OPTIONS}
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
                    <FilterSelect
                        value={accessFilter}
                        onValueChange={setAccessFilter}
                        placeholder="All access"
                        options={ACCESS_TYPE_OPTIONS}
                        onClear={() => setAccessFilter('all')}
                        isCustomized={accessFilter !== 'all'}
                        disabled={!searchTrigger}
                    />
                </div>
            </div>

            {/* ── Row 2: Stats bar — visible after search ── */}
            {searchTrigger && (
                <div className={styles.statsBar}>
                    <div className={styles.badge} data-status="Active">
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>check_circle</span>
                        <span className={styles.badgeLabel}>{stats.active} active</span>
                    </div>
                    <div className={styles.badge} data-status="Inactive">
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>block</span>
                        <span className={styles.badgeLabel}>{stats.inactive} inactive</span>
                    </div>
                    <div className={styles.statSpacer} />
                    <span className={styles.resultCount}>
                        {isFiltered
                            ? `${finalResults.length} of ${stats.total} records`
                            : `${stats.total} records`
                        }
                    </span>
                </div>
            )}

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
                        rowSelection={selectedIds}
                        onRowSelectionChange={handleSelectionChange}
                        onRevokeRow={openSingleRevokeConfirm}
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

            {/* ── Bulk action footer ── */}
            {selectedCount > 0 && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={openBulkRevokeConfirm}
                    onClear={() => {
                        setSelectedIds({});
                        setInspectedRecord(null);
                    }}
                    actionLabel="Revoke access"
                    actionIcon="no_accounts"
                    disabledMessage={isMixedSelection ? 'No valid actions' : undefined}
                />
            )}

            {/* ── Revoke confirmation modal ── */}
            <Modal
                isOpen={isRevokeConfirmOpen}
                onClose={() => setIsRevokeConfirmOpen(false)}
                title="Revoke access"
                width="360px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>Revoke access</div>
                    <Button
                        variant="tertiary"
                        size="s"
                        iconOnly
                        onClick={() => setIsRevokeConfirmOpen(false)}
                        disabled={isExecuting}
                    >
                        <span className="material-symbols-rounded">close</span>
                    </Button>
                </Modal.Header>
                <Modal.Content>
                    <div className={styles.confirmBody}>
                        <div className={styles.warningBannerYellow}>
                            <span className={`material-symbols-rounded ${styles.warningBannerIconYellow}`}>warning</span>
                            <span>Access will be removed from the selected records. You can add access again later if needed.</span>
                        </div>
                        <p className={styles.confirmText}>
                            Are you sure you want to revoke portal access for <strong>{pendingCount} record{pendingCount > 1 ? 's' : ''}</strong>?
                        </p>
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        <Button
                            variant="primary"
                            size="m"
                            onClick={() => {
                                setIsRevokeConfirmOpen(false);
                                void handleRemoveAccess();
                            }}
                            loading={isExecuting}
                        >
                            Revoke access
                        </Button>
                        <Button
                            variant="secondary"
                            size="m"
                            onClick={() => setIsRevokeConfirmOpen(false)}
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
