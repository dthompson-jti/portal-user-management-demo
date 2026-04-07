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
import { Accordion } from '../../components/Accordion';
import { CaseHeader } from './CaseHeader';
import { OverviewBadge } from '../../components/OverviewBadge';
import styles from './PortalCaseAccessManager.module.css';

interface PortalCaseAccessManagerProps {
    caseNum?: string;
    /** Compact mode: hides CaseHeader and case tabs, shows case number as heading */
    compact?: boolean;
}

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';
const getPortalAccessLabel = (status: PortalAccessRecord['status']) => status === 'Active' ? 'Portal access' : 'No Portal access';


export const PortalCaseAccessManager: React.FC<PortalCaseAccessManagerProps> = ({ caseNum = 'CIV-24-0000016', compact = false }) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);

    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<string[]>([]);

    const caseResults = useMemo(() => {
        return results.filter(r => r.caseNumber.includes(caseNum));
    }, [results, caseNum]);

    // Split into three groups matching the mockup
    const withAccess = useMemo(() =>
        caseResults.filter(r => r.accessGroup === 'With portal access'),
    [caseResults]);

    const partiesWithout = useMemo(() =>
        caseResults.filter(r => r.accessGroup === 'Parties without access'),
    [caseResults]);

    const assignmentsWithout = useMemo(() =>
        caseResults.filter(r => r.accessGroup === 'Case assignments without access'),
    [caseResults]);

    const withAccessCount = withAccess.length;
    const withoutAccessCount = partiesWithout.length + assignmentsWithout.length;

    const handleBulkAction = async () => {
        const ids = pendingIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        const selected = caseResults.filter(r => ids.includes(r.id));
        const isRevoke = selected.some(r => r.status === 'Active');
        const actionStatus: 'Inactive' | 'Active' = isRevoke ? 'Inactive' : 'Active';

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? { ...r, status: actionStatus } : r
        ));

        setIsExecuting(false);
        addToast({
            title: isRevoke ? 'Access removed' : 'Access Granted',
            message: `Successfully updated portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: isRevoke ? 'no_accounts' : 'person_add',
            variant: 'success'
        });
        setPendingIds([]);
        setSelectedIds({});
        setIsConfirmOpen(false);
    };

    // Columns matching mockup: Email address | Case Participant Role | Portal Access
    const columns: ColumnDef<PortalAccessRecord, unknown>[] = [
        {
            accessorKey: 'email',
            header: 'Email address',
            size: 300,
            minSize: 200,
            cell: ({ row }) => renderEmailValue(row.original.email),
        },
        {
            accessorKey: 'participantRole',
            header: 'Case Participant Role',
            size: 300,
            minSize: 200,
        },
        {
            accessorKey: 'status',
            header: 'Portal Access',
            size: 160,
            minSize: 120,
            cell: ({ row }) => {
                return (
                    <StatusBadge
                        status={row.original.status as StatusBadgeType}
                        label={getPortalAccessLabel(row.original.status)}
                        showIcon={false}
                    />
                );
            }
        },
    ];

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const selectedRecords = caseResults.filter(r => selectedIds[r.id]);
    const isRevokeMode = selectedRecords.some(r => r.status === 'Active');

    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const statuses = new Set(selectedRecords.map(r => r.status));
        return statuses.size > 1;
    }, [selectedCount, selectedRecords]);

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

            <div className={styles.sectionIntro}>
                <h3 className={styles.sectionHeading}>{compact ? caseNum : 'Manage Portal Access'}</h3>
                <div className={styles.summaryRow}>
                    <OverviewBadge
                        icon="group"
                        label="Portal access"
                        value={withAccessCount.toString()}
                        variant="success"
                        className={styles.summaryBadge}
                    />
                    <OverviewBadge
                        icon="person_off"
                        label="No Portal access"
                        value={withoutAccessCount.toString()}
                        variant="warning"
                        className={styles.summaryBadge}
                    />
                </div>
            </div>

            <div className={styles.sections}>
                <Accordion
                    className={styles.sectionShell}
                    defaultValue={['with-access']}
                >
                    <Accordion.Item
                        value="with-access"
                        title="Portal access"
                        rightSlot={
                            <StatusBadge
                                status="Active"
                                label={`${withAccess.length} Portal access`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={withAccess}
                            columns={columns}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => {
                                setPendingIds([row.id]);
                                setIsConfirmOpen(true);
                            }}
                            actionLabel="Revoke"
                            actionIcon="no_accounts"
                            isLoading={isExecuting && withAccess.length === 0}
                            emptyState={<div className={styles.empty}>No records to display.</div>}
                        />
                    </Accordion.Item>
                </Accordion>

                <Accordion
                    className={styles.sectionShell}
                    defaultValue={['parties-without']}
                >
                    <Accordion.Item
                        value="parties-without"
                        title="No Portal access: Parties"
                        rightSlot={
                            <StatusBadge
                                status="Inactive"
                                label={`${partiesWithout.length} No Portal access`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={partiesWithout}
                            columns={columns}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => {
                                setPendingIds([row.id]);
                                setIsConfirmOpen(true);
                            }}
                            actionLabel="Grant"
                            actionIcon="person_add"
                            isLoading={isExecuting && partiesWithout.length === 0}
                            emptyState={<div className={styles.empty}>No records to display.</div>}
                        />
                    </Accordion.Item>
                </Accordion>

                <Accordion
                    className={styles.sectionShell}
                    defaultValue={['assignments-without']}
                >
                    <Accordion.Item
                        value="assignments-without"
                        title="No Portal access: Case assignments"
                        rightSlot={
                            <StatusBadge
                                status="Inactive"
                                label={`${assignmentsWithout.length} No Portal access`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={assignmentsWithout}
                            columns={columns}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => {
                                setPendingIds([row.id]);
                                setIsConfirmOpen(true);
                            }}
                            actionLabel="Grant"
                            actionIcon="person_add"
                            isLoading={isExecuting && assignmentsWithout.length === 0}
                            emptyState={<div className={styles.empty}>No records to display.</div>}
                        />
                    </Accordion.Item>
                </Accordion>
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
                    disabledMessage={isMixedSelection ? 'No valid actions' : undefined}
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
