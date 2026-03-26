import React, { useState, useMemo, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { TriggeredSearch } from '../../components/TriggeredSearch';
import { SearchInput } from '../../components/SearchInput';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { addToastAtom } from '../../data/toastAtoms';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import styles from './PortalEmailSearch.module.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Revoked', label: 'Revoked' },
    { value: 'Expired', label: 'Expired' },
];

export const PortalEmailSearch: React.FC = () => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);
    
    const [localQuery, setLocalQuery] = useState('');
    const [searchTrigger, setSearchTrigger] = useState('');
    const [quickFilter, setQuickFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
    const [pendingRevokeIds, setPendingRevokeIds] = useState<string[]>([]);

    // sticky results: once searched, these remain even if they no longer match the broad filter
    const [visibleResults, setVisibleResults] = useState<PortalAccessRecord[]>([]);

    const handleSearch = useCallback((val: string) => {
        setSearchTrigger(val);
        setQuickFilter(''); 
        setStatusFilter('all');
        const q = val.toLowerCase();
        
        // Capture initial results
        const matches = results.filter(r => 
            r.email.toLowerCase().includes(q) || 
            r.caseNumber.toLowerCase().includes(q) ||
            r.caseName.toLowerCase().includes(q)
        );
        setVisibleResults(matches);
    }, [results]);

    // Stage 2: Quick filter + Status filter (Sub-filtering the sticky results)
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
                r.participantRole.toLowerCase().includes(q)
            );
        }

        return current;
    }, [visibleResults, quickFilter, statusFilter]);

    const handleRemoveAccess = async () => {
        const ids = pendingRevokeIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        const count = ids.length;
        
        await new Promise(r => setTimeout(r, 1200));

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: 'Revoked' as const } : r
        ));

        // Update local sticky results so they don't disappear
        setVisibleResults(prev => prev.map(r => 
            ids.includes(r.id) ? { ...r, status: 'Revoked' as const } : r
        ));

        setIsExecuting(false);
        setPendingRevokeIds([]);
        setSelectedIds(prev => {
            const next = { ...prev };
            ids.forEach(id => delete next[id]);
            return next;
        });
        
        addToast({
            title: 'Access Revoked',
            message: `Successfully removed portal access for ${count} record${count > 1 ? 's' : ''}.`,
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

    const columns: ColumnDef<PortalAccessRecord, unknown>[] = [
        { 
            accessorKey: 'caseNumber',
            header: 'Case Number', 
            size: 150,
            minSize: 120
        },
        { accessorKey: 'caseName', header: 'Case Name', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        { 
            accessorKey: 'status', 
            header: 'Status', 
            size: 120,
            minSize: 100,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? (
                        <span className={styles.statusBadge} data-status={val}>
                            {val}
                        </span>
                ) : null;
            }
        },
    ];

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const pendingCount = pendingRevokeIds.length;

    return (
        <div className={styles.view}>
            {/* Row 1: Triggered Search */}
            <div className={styles.triggeredSearchRow}>
                <div className={styles.searchBar}>
                        <TriggeredSearch
                            value={localQuery}
                            onChange={setLocalQuery}
                            onSearch={(q) => void handleSearch(q)}
                            placeholder="Enter email or case ID to search..."
                        />
                    </div>
                </div>

            {/* Row 2: (Conditional) Quick Filter + Dropdowns */}
            {searchTrigger && (
                <div className={styles.quickFilterRow}>
                    <div className={styles.quickFilterLeft}>
                        <div className={styles.quickFilterWrapper}>
                            <SearchInput
                                value={quickFilter}
                                onChange={setQuickFilter}
                                placeholder="Find within results..."
                                flavor="instant"
                                size="sm"
                            />
                        </div>
                    </div>
                    <div className={styles.quickFilterRight}>
                        <div className={styles.filterGroup}>
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
                        <p>Search by email or case ID to see results.</p>
                    </div>
                ) : (
                    <PortalDataTable 
                        data={finalResults} 
                        columns={columns} 
                        rowSelection={selectedIds}
                        onRowSelectionChange={setSelectedIds}
                        onRevokeRow={openSingleRevokeConfirm}
                        isLoading={isExecuting && finalResults.length === 0}
                        emptyState={<div className={styles.empty}>No matching projects found.</div>}
                    />
                )}
            </div>

            {selectedCount > 0 && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={openBulkRevokeConfirm}
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
