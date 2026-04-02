import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
    isPortalAdvancedSearchOpenAtom,
    isPortalActionExecutingAtom,
    portalInspectedRecordAtom,
    portalResultsAtom,
    portalSelectedCountAtom,
} from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { InstantSearch } from '../../components/InstantSearch';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { addToastAtom } from '../../data/toastAtoms';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import {
    EMPTY_PORTAL_ACCESS_FILTERS,
    PortalAccessAdvancedSearch,
    PortalAccessFilters,
} from './PortalAccessAdvancedSearch';
import styles from './PortalAccess.module.css';

const STATUS_BADGE_CONFIG = {
    Active: { label: 'Portal access', icon: 'check_circle' },
    Revoked: { label: 'No Portal access', icon: 'block' },
    Expired: { label: 'No Portal access', icon: 'schedule' },
} as const;

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'Active', label: 'Portal access' },
    { value: 'Revoked', label: 'No Portal access (Revoked)' },
    { value: 'Expired', label: 'No Portal access (Expired)' },
];

const CASE_TYPE_OPTIONS = [
    { value: 'all', label: 'All case types' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Criminal', label: 'Criminal' },
    { value: 'Juvenile', label: 'Juvenile' },
];

const ACCESS_TYPE_OPTIONS = [
    { value: 'all', label: 'All access types' },
    { value: 'Direct access', label: 'Direct access' },
    { value: 'Delegated access', label: 'Delegated access' },
];

const hasTextMatch = (value: string | undefined, query: string) =>
    (value || '').toLowerCase().includes(query.trim().toLowerCase());

const isDefaultFilterSet = (filters: PortalAccessFilters) =>
    filters.query === EMPTY_PORTAL_ACCESS_FILTERS.query &&
    filters.email === EMPTY_PORTAL_ACCESS_FILTERS.email &&
    filters.caseNumber === EMPTY_PORTAL_ACCESS_FILTERS.caseNumber &&
    filters.caseName === EMPTY_PORTAL_ACCESS_FILTERS.caseName &&
    filters.participant === EMPTY_PORTAL_ACCESS_FILTERS.participant &&
    filters.author === EMPTY_PORTAL_ACCESS_FILTERS.author &&
    filters.status === EMPTY_PORTAL_ACCESS_FILTERS.status &&
    filters.caseType === EMPTY_PORTAL_ACCESS_FILTERS.caseType &&
    filters.accessType === EMPTY_PORTAL_ACCESS_FILTERS.accessType;

export const PortalAccess: React.FC = () => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const [isAdvancedOpen, setIsAdvancedOpen] = useAtom(isPortalAdvancedSearchOpenAtom);
    const addToast = useSetAtom(addToastAtom);

    const setInspectedRecord = useSetAtom(portalInspectedRecordAtom);
    const setPortalSelectedCount = useSetAtom(portalSelectedCountAtom);

    const [quickQuery, setQuickQuery] = useState('');
    const [draftFilters, setDraftFilters] = useState<PortalAccessFilters>(EMPTY_PORTAL_ACCESS_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<PortalAccessFilters>(EMPTY_PORTAL_ACCESS_FILTERS);

    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
    const [pendingRevokeIds, setPendingRevokeIds] = useState<string[]>([]);

    const selectedCount = Object.keys(selectedIds).filter(key => selectedIds[key]).length;

    useEffect(() => {
        setPortalSelectedCount(selectedCount);
    }, [selectedCount, setPortalSelectedCount]);

    useEffect(() => {
        return () => {
            setInspectedRecord(null);
            setPortalSelectedCount(0);
            setIsAdvancedOpen(false);
        };
    }, [setInspectedRecord, setPortalSelectedCount, setIsAdvancedOpen]);

    const finalResults = useMemo(() => {
        return results.filter((record) => {
            if (appliedFilters.query) {
                const matchesGeneralQuery =
                    hasTextMatch(record.email, appliedFilters.query) ||
                    hasTextMatch(record.caseNumber, appliedFilters.query) ||
                    hasTextMatch(record.caseName, appliedFilters.query) ||
                    hasTextMatch(record.participantRole, appliedFilters.query) ||
                    hasTextMatch(record.author, appliedFilters.query) ||
                    hasTextMatch(record.sharedWith, appliedFilters.query) ||
                    hasTextMatch(record.purpose, appliedFilters.query);

                if (!matchesGeneralQuery) return false;
            }

            if (appliedFilters.email && !hasTextMatch(record.email, appliedFilters.email)) return false;
            if (appliedFilters.caseNumber && !hasTextMatch(record.caseNumber, appliedFilters.caseNumber)) return false;
            if (appliedFilters.caseName && !hasTextMatch(record.caseName, appliedFilters.caseName)) return false;
            if (appliedFilters.participant && !hasTextMatch(record.participantRole, appliedFilters.participant)) return false;

            if (appliedFilters.author) {
                const matchesAudit =
                    hasTextMatch(record.author, appliedFilters.author) ||
                    hasTextMatch(record.sharedWith, appliedFilters.author);
                if (!matchesAudit) return false;
            }

            if (appliedFilters.status !== 'all' && record.status !== appliedFilters.status) return false;
            if (appliedFilters.caseType !== 'all' && record.caseType !== appliedFilters.caseType) return false;
            if (appliedFilters.accessType !== 'all' && record.accessType !== appliedFilters.accessType) return false;

            return true;
        });
    }, [appliedFilters, results]);

    const isFiltered = useMemo(() => !isDefaultFilterSet(appliedFilters), [appliedFilters]);

    const applyFilters = useCallback((nextFilters: PortalAccessFilters) => {
        setAppliedFilters(nextFilters);
        setQuickQuery(nextFilters.query);
        setSelectedIds({});
        setInspectedRecord(null);
    }, [setInspectedRecord]);

    const handleQuickQueryChange = useCallback((value: string) => {
        setQuickQuery(value);
        const nextFilters = { ...appliedFilters, query: value };
        setDraftFilters(nextFilters);
        setAppliedFilters(nextFilters);
        setSelectedIds({});
        setInspectedRecord(null);
    }, [appliedFilters, setInspectedRecord]);

    const handleDraftChange = useCallback(<K extends keyof PortalAccessFilters>(key: K, nextValue: PortalAccessFilters[K]) => {
        setDraftFilters(prev => ({ ...prev, [key]: nextValue }));
    }, []);

    const handleAdvancedSearch = useCallback(() => {
        applyFilters({ ...draftFilters, query: draftFilters.query.trim() });
    }, [applyFilters, draftFilters]);

    const handleResetFilters = useCallback(() => {
        setDraftFilters(EMPTY_PORTAL_ACCESS_FILTERS);
        applyFilters(EMPTY_PORTAL_ACCESS_FILTERS);
    }, [applyFilters]);

    const handleQuickFilterChange = useCallback((key: 'status' | 'caseType' | 'accessType', value: string) => {
        const nextFilters = { ...appliedFilters, [key]: value };
        setDraftFilters(nextFilters);
        setAppliedFilters(nextFilters);
        setSelectedIds({});
        setInspectedRecord(null);
    }, [appliedFilters, setInspectedRecord]);

    const handleRemoveAccess = async () => {
        const ids = pendingRevokeIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        const count = ids.length;

        await new Promise(resolve => setTimeout(resolve, 1200));

        setResults(prev => prev.map(record =>
            ids.includes(record.id) ? { ...record, status: 'Revoked' as const } : record
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
            variant: 'success',
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

    const handleSelectionChange: React.Dispatch<React.SetStateAction<RowSelectionState>> = useCallback((updater) => {
        setSelectedIds(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            const activeIds = Object.keys(next).filter(key => next[key]);

            if (activeIds.length === 1) {
                const record = finalResults.find(item => item.id === activeIds[0]) ?? null;
                setInspectedRecord(record);
            } else {
                setInspectedRecord(null);
            }

            return next;
        });
    }, [finalResults, setInspectedRecord]);

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
            size: 170,
            minSize: 154,
            cell: ({ getValue }) => {
                const value = getValue() as keyof typeof STATUS_BADGE_CONFIG;
                const config = STATUS_BADGE_CONFIG[value];
                if (!config) return value;

                return (
                    <div className={styles.badge} data-status={value}>
                        <span className={`material-symbols-rounded ${styles.badgeIcon}`}>{config.icon}</span>
                        <span>{config.label}</span>
                    </div>
                );
            },
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
            size: 140,
            minSize: 110,
        },
    ], []);

    return (
        <div className={styles.view}>
            {isAdvancedOpen ? (
                <PortalAccessAdvancedSearch
                    value={draftFilters}
                    onChange={handleDraftChange}
                    onSearch={handleAdvancedSearch}
                    onReset={handleResetFilters}
                    onClose={() => setIsAdvancedOpen(false)}
                />
            ) : (
                <div className={styles.toolbar}>
                    <div className={styles.leftSection}>
                        <div className={styles.searchBar}>
                            <InstantSearch
                                value={quickQuery}
                                onChange={handleQuickQueryChange}
                                placeholder="Find records"
                                size="md"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            size="m"
                            iconOnly
                            onClick={() => {
                                setDraftFilters(appliedFilters);
                                setIsAdvancedOpen(true);
                            }}
                            aria-label="Advanced search"
                        >
                            <span className="material-symbols-rounded">tune</span>
                        </Button>
                    </div>

                    <div className={styles.filterChips}>
                        {isFiltered && (
                            <Button
                                variant="tertiary"
                                size="m"
                                onClick={handleResetFilters}
                            >
                                Reset filters
                            </Button>
                        )}
                        <FilterSelect
                            value={appliedFilters.status}
                            isCustomized={appliedFilters.status !== 'all'}
                            onValueChange={(value) => handleQuickFilterChange('status', value)}
                            onClear={() => handleQuickFilterChange('status', 'all')}
                            placeholder="Status"
                            options={STATUS_OPTIONS}
                        />
                        <FilterSelect
                            value={appliedFilters.caseType}
                            isCustomized={appliedFilters.caseType !== 'all'}
                            onValueChange={(value) => handleQuickFilterChange('caseType', value)}
                            onClear={() => handleQuickFilterChange('caseType', 'all')}
                            placeholder="Case type"
                            options={CASE_TYPE_OPTIONS}
                        />
                        <FilterSelect
                            value={appliedFilters.accessType}
                            isCustomized={appliedFilters.accessType !== 'all'}
                            onValueChange={(value) => handleQuickFilterChange('accessType', value)}
                            onClear={() => handleQuickFilterChange('accessType', 'all')}
                            placeholder="Access type"
                            options={ACCESS_TYPE_OPTIONS}
                        />
                    </div>
                </div>
            )}

            <div className={styles.tableWrapper}>
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
                            <p className={styles.emptyTitle}>No portal records</p>
                            <p className={styles.emptyHint}>
                                Try broadening the search terms or resetting the advanced filters.
                            </p>
                        </div>
                    }
                />
            </div>

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
                />
            )}

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
                            Are you sure you want to revoke portal access for <strong>{pendingRevokeIds.length} record{pendingRevokeIds.length > 1 ? 's' : ''}</strong>?
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
