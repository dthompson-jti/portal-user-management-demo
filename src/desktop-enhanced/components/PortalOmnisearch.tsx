import React, { useState, useMemo, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom, portalDensityModeAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { TriggeredSearch } from '../../components/TriggeredSearch';
import { InstantSearch } from '../../components/InstantSearch';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { addToastAtom } from '../../data/toastAtoms';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import styles from './PortalEmailSearch.module.css'; // Reusing CSS

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Revoked', label: 'Revoked' },
    { value: 'Expired', label: 'Expired' },
];

const GROUP_OPTIONS = [
    { value: 'none', label: 'No grouping' },
    { value: 'status', label: 'Group by Status' },
    { value: 'participantRole', label: 'Group by Role' },
];

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';
const getPortalAccessBadgeLabel = (status: string) => status === 'Active' ? 'Portal access' : 'No Portal access';

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
    
    // Search & Context State
    const [localQuery, setLocalQuery] = useState('');
    const [searchTrigger, setSearchTrigger] = useState('');
    const [queryContext, setQueryContext] = useState<'email' | 'case' | null>(null);

    // Filters & View State
    const [quickFilter, setQuickFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [groupBy, setGroupBy] = useState('none');

    // Selection & Actions
    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
    const [pendingRevokeIds, setPendingRevokeIds] = useState<string[]>([]);
    const [visibleResults, setVisibleResults] = useState<PortalAccessRecord[]>([]);

    const handleSearch = useCallback((val: string) => {
        setSearchTrigger(val);
        setQuickFilter(''); 
        setStatusFilter('all');
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
        setVisibleResults(matches);
    }, [results]);

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

    const handleRemoveAccess = async () => {
        const ids = pendingRevokeIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: 'Revoked' as const } : r
        ));

        setVisibleResults(prev => prev.map(r => 
            ids.includes(r.id) ? { ...r, status: 'Revoked' as const } : r
        ));

        setIsExecuting(false);
        setPendingRevokeIds([]);
        setSelectedIds({});
        
        addToast({
            title: 'Access Revoked',
            message: `Successfully removed portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: 'no_accounts',
            variant: 'success'
        });
    };

    const caseColumns: ColumnDef<PortalAccessRecord, unknown>[] = [
        {
            accessorKey: 'email',
            header: 'Email Address',
            size: 250,
            minSize: 200,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        { accessorKey: 'participantRole', header: 'Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Portal Role(s)', size: 150, minSize: 120 },
        { 
            accessorKey: 'status', 
            header: 'Status', 
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? <StatusBadge status={val as StatusBadgeType} label={getPortalAccessBadgeLabel(val)} /> : null;
            }
        },
    ];

    const emailColumns: ColumnDef<PortalAccessRecord, unknown>[] = [
        { accessorKey: 'caseNumber', header: 'Case Number', size: 150, minSize: 120 },
        { accessorKey: 'caseName', header: 'Case Name', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        { 
            accessorKey: 'status', 
            header: 'Status', 
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? <StatusBadge status={val as StatusBadgeType} label={getPortalAccessBadgeLabel(val)} /> : null;
            }
        },
    ];

    const emailFirstColumns: ColumnDef<PortalAccessRecord, unknown>[] = [
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
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? <StatusBadge status={val as StatusBadgeType} label={getPortalAccessBadgeLabel(val)} /> : null;
            }
        },
    ];

    const caseEmailColumns: ColumnDef<PortalAccessRecord, unknown>[] = [
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
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? <StatusBadge status={val as StatusBadgeType} label={getPortalAccessBadgeLabel(val)} /> : null;
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
    const minSearchLength = matchMode === 'partial' ? 1 : 3;
    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const pendingCount = pendingRevokeIds.length;
    const showResultControls = visibleResults.length > 0;

    return (
        <div className={styles.view}>
            {/* Row 1: Triggered Search */}
            <div className={styles.triggeredSearchRow}>
                <div className={styles.searchBar}>
                        <TriggeredSearch
                            value={localQuery}
                            onChange={setLocalQuery}
                            onSearch={(q) => void handleSearch(q)}
                            placeholder={mode === 'email' ? 'Search by email' : mode === 'case' ? 'Search by case ID' : 'Search by email or case ID'}
                            minSearchLength={minSearchLength}
                        />
                </div>
            </div>

            {/* Row 2: Settings & Filters */}
            {showResultControls && (
                <div className={styles.quickFilterRow}>
                    <div className={styles.quickFilterLeft}>
                        <div className={styles.quickFilterWrapper}>
                            <InstantSearch
                                value={quickFilter}
                                onChange={setQuickFilter}
                                placeholder="Find within results..."
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className={styles.quickFilterRight}>
                        <div className={styles.filterGroup}>
                            <FilterSelect
                                value={groupBy}
                                onValueChange={setGroupBy}
                                placeholder="Grouping"
                                options={GROUP_OPTIONS}
                                onClear={() => setGroupBy('none')}
                                isCustomized={groupBy !== 'none'}
                            />
                            <FilterSelect
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                placeholder="All Statuses"
                                options={STATUS_OPTIONS}
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
                        <p>{mode === 'email' ? 'Search by email to retrieve access records.' : mode === 'case' ? 'Search by case ID to retrieve access records.' : 'Search by email or case ID to retrieve access records.'}</p>
                    </div>
                ) : (
                    <PortalDataTable 
                        data={finalResults} 
                        columns={activeColumns} 
                        rowSelection={selectedIds}
                        onRowSelectionChange={setSelectedIds}
                        onRevokeRow={(row) => {
                            setPendingRevokeIds([row.id]);
                            setIsRevokeConfirmOpen(true);
                        }}
                        densityMode={densityMode}
                        groupBy={groupBy}
                        isLoading={isExecuting && finalResults.length === 0}
                        hideHeaderControlsWhenEmpty={mode === 'email' || mode === 'case'}
                        emptyState={<div className={styles.empty}>No matching access records found.</div>}
                    />
                )}
            </div>

            {selectedCount > 0 && densityMode !== 'quick-actions' && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={() => {
                        const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
                        setPendingRevokeIds(ids);
                        setIsRevokeConfirmOpen(true);
                    }}
                    onClear={() => setSelectedIds({})}
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
