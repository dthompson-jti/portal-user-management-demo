import React, { useState, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom, portalDensityModeAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { FilterSelect } from '../../desktop/components/FilterSelect';
import { InstantSearch } from '../../components/InstantSearch';
import { addToastAtom } from '../../data/toastAtoms';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { CaseHeader } from './CaseHeader';
import { OverviewBadge } from '../../components/OverviewBadge';
import { useTerminology } from '../hooks/useTerminology';
import styles from './PortalCaseAccessManager.module.css';
import tableStyles from './PortalCaseSearchII.module.css';

interface PortalCaseSearchIIProps {
    caseNum?: string;
    compact?: boolean;
}

type AccessAction = 'grant' | 'revoke';
const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';

export const PortalCaseSearchII: React.FC<PortalCaseSearchIIProps> = ({
    caseNum = 'CIV-24-0000016',
    compact = false,
}) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const densityMode = useAtomValue(portalDensityModeAtom);
    const addToast = useSetAtom(addToastAtom);
    const terminology = useTerminology();

    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<AccessAction>('revoke');
    const [statusFilter, setStatusFilter] = useState('all');
    const [participantTypeFilter, setParticipantTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // All records for this case
    const caseResults = useMemo(() =>
        results.filter(r => r.caseNumber.includes(caseNum)),
    [results, caseNum]);

    // Filtered results for the table
    const finalResults = useMemo(() => {
        let current = caseResults;
        if (statusFilter !== 'all') {
            current = current.filter(r => r.status === statusFilter);
        }
        if (participantTypeFilter !== 'all') {
            const isAssignment = participantTypeFilter === 'case-assignment';
            current = current.filter(r =>
                isAssignment
                    ? (r.accessGroup ?? '').toLowerCase().includes('assignment')
                    : !(r.accessGroup ?? '').toLowerCase().includes('assignment')
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            current = current.filter(r =>
                r.email.toLowerCase().includes(q) ||
                r.participantRole.toLowerCase().includes(q) ||
                r.accessType.toLowerCase().includes(q)
            );
        }
        return current;
    }, [caseResults, statusFilter, participantTypeFilter, searchQuery]);

    // Summary counts (always from unfiltered)
    const withAccessCount = caseResults.filter(r => r.status === 'Active').length;
    const withoutAccessCount = caseResults.filter(r => r.status === 'Inactive').length;

    const handleBulkAction = async () => {
        const ids = pendingIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        const actionStatus: 'Active' | 'Inactive' = pendingAction === 'revoke' ? 'Inactive' : 'Active';
        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: actionStatus } : r
        ));

        setIsExecuting(false);
        addToast({
            title: pendingAction === 'revoke' ? 'Access removed' : 'Access granted',
            message: `Successfully updated portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: pendingAction === 'revoke' ? 'no_accounts' : 'person_add',
            variant: 'success',
        });
        setPendingIds([]);
        setSelectedIds({});
        setIsConfirmOpen(false);
    };

    const openActionConfirm = (records: PortalAccessRecord[]) => {
        const ids = records.map(r => r.id);
        if (ids.length === 0) return;
        setPendingIds(ids);
        setPendingAction(records[0]?.status === 'Active' ? 'revoke' : 'grant');
        setIsConfirmOpen(true);
    };

    const columns: ColumnDef<PortalAccessRecord, unknown>[] = useMemo(() => [
        {
            id: 'participantType',
            accessorFn: (row) => (row.accessGroup ?? '').toLowerCase().includes('assignment') ? 'Case assignment' : 'Party',
            header: 'Participant type',
            size: 160,
            minSize: 130,
            cell: ({ getValue }) => getValue() as string,
        },
        {
            accessorKey: 'email',
            header: 'Email address',
            size: 280,
            minSize: 200,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        {
            accessorKey: 'participantRole',
            header: 'Case Participant Role',
            size: 280,
            minSize: 200,
        },
        {
            accessorKey: 'status',
            header: terminology.columnHeader,
            size: 170,
            minSize: 130,
            cell: ({ row }) => (
                <StatusBadge
                    status={row.original.status as StatusBadgeType}
                    label={terminology.getStatusLabel(row.original.status)}
                    showIcon={false}
                />
            ),
        },
    ], [terminology]);

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const selectedRecords = useMemo(
        () => finalResults.filter(r => selectedIds[r.id]),
        [finalResults, selectedIds]
    );
    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const statuses = new Set(selectedRecords.map(r => r.status));
        return statuses.size > 1;
    }, [selectedCount, selectedRecords]);

    const selectedAction: AccessAction = selectedRecords[0]?.status === 'Active' ? 'revoke' : 'grant';
    const selectedActionLabel = selectedAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const selectedActionIcon = selectedAction === 'revoke' ? 'no_accounts' : 'person_add';
    const pendingActionLabel = pendingAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const pendingActionVerb = pendingAction === 'revoke' ? 'revoke' : 'grant';

    return (
        <div className={styles.view}>
            {!compact && (
                <CaseHeader
                    caseNumber="CIV-24-0000016"
                    courtLocation="Magistrates Court"
                    caseTitle="Agnes Schlauderheide v Kirsty Ware, FLARB'S FLARBENARIUM and others"
                    caseType="Claim - Debt"
                />
            )}

            {/* Summary tiles */}
            <div className={styles.sectionIntro}>
                <h3 className={styles.sectionHeading}>{compact ? caseNum : 'Manage Portal Access'}</h3>
                <div className={styles.summaryRow}>
                    <OverviewBadge
                        icon="group"
                        label={terminology.activeLabel}
                        value={withAccessCount.toString()}
                        variant="success"
                        className={styles.summaryBadge}
                    />
                    <OverviewBadge
                        icon="person_off"
                        label={terminology.inactiveLabel}
                        value={withoutAccessCount.toString()}
                        variant="alert"
                        className={styles.summaryBadge}
                    />
                </div>
            </div>

            {/* Table + filter toolbar */}
            <div className={tableStyles.tableSection}>
                <div className={tableStyles.tableToolbar}>
                    <div className={tableStyles.toolbarSearch}>
                        <InstantSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Filter by email, role, or access type"
                            size="md"
                        />
                    </div>
                    <div className={tableStyles.toolbarFilters}>
                        <FilterSelect
                            value={participantTypeFilter}
                            onValueChange={setParticipantTypeFilter}
                            placeholder="All participant types"
                            options={[
                                { value: 'all', label: 'All participant types' },
                                { value: 'party', label: 'Party' },
                                { value: 'case-assignment', label: 'Case assignment' },
                            ]}
                            onClear={() => setParticipantTypeFilter('all')}
                            isCustomized={participantTypeFilter !== 'all'}
                        />
                        <FilterSelect
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                            placeholder="All statuses"
                            options={terminology.statusOptions}
                            onClear={() => setStatusFilter('all')}
                            isCustomized={statusFilter !== 'all'}
                        />
                    </div>
                </div>

                <PortalDataTable
                    data={finalResults}
                    columns={columns}
                    densityMode={densityMode}
                    lazy
                    rowSelection={selectedIds}
                    onRowSelectionChange={setSelectedIds}
                    onRevokeRow={(row) => openActionConfirm([row])}
                    getRowAction={(row) => row.status === 'Active'
                        ? {
                            label: 'Revoke',
                            icon: 'no_accounts',
                            destructive: true,
                            variant: 'secondary',
                            onClick: () => openActionConfirm([row]),
                        }
                        : {
                            label: 'Grant',
                            icon: 'person_add',
                            variant: 'primary',
                            onClick: () => openActionConfirm([row]),
                        }}
                    isLoading={isExecuting && finalResults.length === 0}
                    emptyState={
                        <div className={styles.empty}>
                            No records match the current filter.
                        </div>
                    }
                />
            </div>

            {selectedCount > 0 && densityMode !== 'quick-actions' && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={() => openActionConfirm(selectedRecords)}
                    onClear={() => setSelectedIds({})}
                    actionLabel={selectedActionLabel}
                    actionIcon={selectedActionIcon}
                    disabledMessage={isMixedSelection ? 'No valid actions' : undefined}
                />
            )}

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title={pendingActionLabel}
                width="360px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>{pendingActionLabel}</div>
                    <Button
                        variant="tertiary"
                        size="s"
                        iconOnly
                        onClick={() => setIsConfirmOpen(false)}
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
                                <span>Please be advised that this action will result in the removal of portal access for all records you have selected.</span>
                            </div>
                        )}
                        <p className={styles.confirmText}>
                            Are you sure you want to {pendingActionVerb} portal access for{' '}
                            <strong>{pendingIds.length} record{pendingIds.length > 1 ? 's' : ''}</strong>?
                        </p>
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        {pendingAction === 'grant' ? (
                            <>
                                <Button
                                    variant="secondary"
                                    size="m"
                                    onClick={() => setIsConfirmOpen(false)}
                                    disabled={isExecuting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    size="m"
                                    onClick={() => { void handleBulkAction(); }}
                                    loading={isExecuting}
                                >
                                    {pendingActionLabel}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="primary"
                                    size="m"
                                    onClick={() => { void handleBulkAction(); }}
                                    loading={isExecuting}
                                >
                                    {pendingActionLabel}
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="m"
                                    onClick={() => setIsConfirmOpen(false)}
                                    disabled={isExecuting}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
