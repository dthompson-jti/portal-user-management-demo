import React, { useState, useMemo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { addToastAtom } from '../../data/toastAtoms';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { AnimatedTabs, Tab } from '../../components/AnimatedTabs';
import styles from './PortalEmailSearch.module.css';

interface PortalCaseAccessManagerProps {
    caseNum?: string;
}

export const PortalCaseAccessManager: React.FC<PortalCaseAccessManagerProps> = ({ caseNum = 'CIV-24-0000013' }) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);
    
    const [activeTab, setActiveTab] = useState<'active' | 'missing'>('active');
    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<string[]>([]);

    const caseResults = useMemo(() => {
        return results.filter(r => r.caseNumber.includes(caseNum));
    }, [results, caseNum]);

    // Split mock data into active vs missing for prototype
    const activeUsers = useMemo(() => caseResults.filter(r => r.status === 'Active'), [caseResults]);
    const missingParties = useMemo(() => caseResults.filter(r => r.status !== 'Active'), [caseResults]);

    const displayedData = activeTab === 'active' ? activeUsers : missingParties;

    const handleBulkAction = async () => {
        const ids = pendingIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        const actionStatus: 'Revoked' | 'Active' = activeTab === 'active' ? 'Revoked' : 'Active';

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: actionStatus } : r
        ));

        setIsExecuting(false);
        addToast({
            title: activeTab === 'active' ? 'Access Revoked' : 'Access Granted',
            message: `Successfully updated portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: activeTab === 'active' ? 'no_accounts' : 'person_add',
            variant: 'success'
        });
        setPendingIds([]);
        setSelectedIds({});
        setIsConfirmOpen(false);
    };

    const columns: ColumnDef<PortalAccessRecord, unknown>[] = [
        { accessorKey: 'email', header: 'Email Address', size: 250, minSize: 200 },
        { accessorKey: 'participantRole', header: 'Case Participant Role', size: 250, minSize: 200 },
        { accessorKey: 'accessType', header: 'Access Type', size: 150, minSize: 120 },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
            minSize: 100,
            cell: ({ getValue }) => {
                const val = getValue() as string;
                return val ? <StatusBadge status={val as StatusBadgeType} /> : null;
            }
        },
    ];

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const isRevokeMode = activeTab === 'active';

    return (
        <div className={styles.view}>
            <div className={styles.insideHeader} style={{ marginBottom: '16px' }}>
                <h3>Folder: {caseNum}</h3>
            </div>

            <div style={{ marginLeft: 'var(--spacing-6)', marginBottom: '16px', borderBottom: '1px solid var(--surface-border-primary)' }}>
                <AnimatedTabs
                    value={activeTab}
                    onValueChange={(val: string) => {
                        setActiveTab(val as 'active' | 'missing');
                        setSelectedIds({});
                    }}
                >
                    <Tab value="active">Active Portal Users <span className="tab-pill">{activeUsers.length}</span></Tab>
                    <Tab value="missing">Missing Access <span className="tab-pill">{missingParties.length}</span></Tab>
                </AnimatedTabs>
            </div>

            <div className={styles.tableWrapper}>
                <PortalDataTable 
                    data={displayedData} 
                    columns={columns} 
                    rowSelection={selectedIds}
                    onRowSelectionChange={setSelectedIds}
                    onRevokeRow={(row) => {
                        setPendingIds([row.id]);
                        setIsConfirmOpen(true);
                    }}
                    actionLabel={isRevokeMode ? 'Revoke' : 'Grant'}
                    actionIcon={isRevokeMode ? 'no_accounts' : 'person_add'}
                    isLoading={isExecuting && displayedData.length === 0}
                    emptyState={<div className={styles.empty}>No records to display.</div>}
                />
            </div>

            {selectedCount > 0 && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={() => {
                        const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
                        setPendingIds(ids);
                        setIsConfirmOpen(true);
                    }}
                    onClear={() => setSelectedIds({})}
                    actionLabel={isRevokeMode ? 'Revoke Access' : 'Grant Access'}
                    actionIcon={isRevokeMode ? 'no_accounts' : 'person_add'}
                />
            )}

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title={isRevokeMode ? 'Revoke access' : 'Grant access'}
                width="360px"
            >
                <Modal.Header>
                    <div className={styles.modalTitle}>{isRevokeMode ? 'Revoke access' : 'Grant access'}</div>
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
                        {isRevokeMode ? (
                            <>
                                <div className={styles.warningBannerYellow}>
                                    <span className={`material-symbols-rounded ${styles.warningBannerIconYellow}`}>warning</span>
                                    <span>Access will be removed from the selected records. You can add access again later if needed.</span>
                                </div>
                                <p className={styles.confirmText}>
                                    Are you sure you want to revoke portal access for <strong>{pendingIds.length} record{pendingIds.length > 1 ? 's' : ''}</strong>?
                                </p>
                            </>
                        ) : (
                            <p className={styles.confirmText}>
                                Are you sure you want to grant portal access for <strong>{pendingIds.length} record{pendingIds.length > 1 ? 's' : ''}</strong>?
                            </p>
                        )}
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        <Button
                            variant="primary"
                            size="m"
                            onClick={() => { void handleBulkAction(); }}
                            loading={isExecuting}
                        >
                            {isRevokeMode ? 'Revoke access' : 'Grant access'}
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="m" 
                            onClick={() => setIsConfirmOpen(false)}
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
