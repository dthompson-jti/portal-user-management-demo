import React, { useState, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { portalResultsAtom, isPortalActionExecutingAtom, portalCaseBadgeModeAtom, portalDensityModeAtom } from '../atoms';
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
import { useTerminology } from '../hooks/useTerminology';
import { applyPortalStatusChange, getPortalParticipantType } from '../utils/portalAccess';
import styles from './PortalCaseAccessManager.module.css';

interface PortalCaseAccessManagerProps {
    caseNum?: string;
    /** Compact mode: hides CaseHeader and case tabs, shows case number as heading */
    compact?: boolean;
}

const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';
type AccessAction = 'grant' | 'revoke';


export const PortalCaseAccessManager: React.FC<PortalCaseAccessManagerProps> = ({ caseNum = 'CIV-24-0000016', compact = false }) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const badgeMode = useAtomValue(portalCaseBadgeModeAtom);
    const densityMode = useAtomValue(portalDensityModeAtom);
    const addToast = useSetAtom(addToastAtom);
    const terminology = useTerminology();

    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<AccessAction>('revoke');

    const caseResults = useMemo(() => {
        return results.filter(r => r.caseNumber === caseNum);
    }, [results, caseNum]);

    // Derive A3 groupings from live state so rows move immediately after grant/revoke.
    const withAccess = useMemo(() =>
        caseResults.filter(r => r.status === 'Active'),
    [caseResults]);

    const partiesWithout = useMemo(() =>
        caseResults.filter(r => r.status === 'Inactive' && getPortalParticipantType(r) === 'party'),
    [caseResults]);

    const assignmentsWithout = useMemo(() =>
        caseResults.filter(r => r.status === 'Inactive' && getPortalParticipantType(r) === 'case-assignment'),
    [caseResults]);

    const withAccessCount = withAccess.length;
    const inactivePartiesCount = partiesWithout.length;
    const inactiveAssignmentsCount = assignmentsWithout.length;
    const withoutAccessCount = inactivePartiesCount + inactiveAssignmentsCount;

    const overviewBadges = useMemo(() => {
        if (badgeMode === 'off') {
            return [];
        }

        if (badgeMode === 'detailed') {
            return [
                {
                    icon: 'group',
                    label: 'Total Active',
                    value: withAccessCount.toString(),
                    variant: 'success' as const,
                },
                {
                    icon: 'person_off',
                    label: 'Inactive: Parties',
                    value: inactivePartiesCount.toString(),
                    variant: 'alert' as const,
                },
                {
                    icon: 'badge',
                    label: 'Inactive: Case Assignments',
                    value: inactiveAssignmentsCount.toString(),
                    variant: 'alert' as const,
                },
            ];
        }

        return [
            {
                icon: 'group',
                label: 'Total Active',
                value: withAccessCount.toString(),
                variant: 'success' as const,
            },
            {
                icon: 'person_off',
                label: 'Total Inactive',
                value: withoutAccessCount.toString(),
                variant: 'alert' as const,
            },
        ];
    }, [badgeMode, withAccessCount, inactivePartiesCount, inactiveAssignmentsCount, withoutAccessCount]);

    const handleBulkAction = async () => {
        const ids = pendingIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        const actionStatus: 'Inactive' | 'Active' = pendingAction === 'revoke' ? 'Inactive' : 'Active';

        setResults(prev => prev.map(r =>
            ids.includes(r.id) ? applyPortalStatusChange(r, actionStatus) : r
        ));

        setIsExecuting(false);
        addToast({
            title: pendingAction === 'revoke' ? 'Access removed' : 'Access granted',
            message: `Successfully updated portal access for ${ids.length} record${ids.length > 1 ? 's' : ''}.`,
            icon: pendingAction === 'revoke' ? 'no_accounts' : 'person_add',
            variant: 'success'
        });
        setPendingIds([]);
        setSelectedIds({});
        setIsConfirmOpen(false);
    };

    const openActionConfirm = (records: PortalAccessRecord[]) => {
        const ids = records.map(record => record.id);
        if (ids.length === 0) return;
        setPendingIds(ids);
        setPendingAction(records[0]?.status === 'Active' ? 'revoke' : 'grant');
        setIsConfirmOpen(true);
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
            header: terminology.columnHeader,
            size: 160,
            minSize: 120,
            cell: ({ row }) => {
                return (
                    <StatusBadge
                        status={row.original.status as StatusBadgeType}
                        label={terminology.getStatusLabel(row.original.status)}
                        showIcon={false}
                    />
                );
            }
        },
    ];

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const selectedRecords = caseResults.filter(r => selectedIds[r.id]);
    const selectedAction: AccessAction = selectedRecords[0]?.status === 'Active' ? 'revoke' : 'grant';

    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const statuses = new Set(selectedRecords.map(r => r.status));
        return statuses.size > 1;
    }, [selectedCount, selectedRecords]);
    const selectedActionLabel = selectedAction === 'revoke' ? 'Revoke Access' : 'Grant Access';
    const selectedActionIcon = selectedAction === 'revoke' ? 'no_accounts' : 'person_add';
    const pendingActionLabel = pendingAction === 'revoke' ? 'Revoke access' : 'Grant access';
    const pendingActionVerb = pendingAction === 'revoke' ? 'revoke' : 'grant';

    return (
        <div className={styles.view}>
            {!compact && (
                <CaseHeader
                    caseNumber={caseNum}
                    courtLocation="Magistrates Court"
                    caseTitle="Agnes Schlauderheide v Kirsty Ware, FLARB'S FLARBENARIUM and others"
                    caseType="Claim - Debt"
                />
            )}

            <div className={styles.sectionIntro}>
                <h3 className={styles.sectionHeading}>{compact ? caseNum : 'Case portal access'}</h3>
                {overviewBadges.length > 0 && (
                    <div className={styles.summaryRow}>
                        {overviewBadges.map((badge) => (
                            <OverviewBadge
                                key={badge.label}
                                icon={badge.icon}
                                label={badge.label}
                                value={badge.value}
                                variant={badge.variant}
                                className={styles.summaryBadge}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.sections}>
                <Accordion
                    className={styles.sectionShell}
                    defaultValue={['with-access']}
                >
                    <Accordion.Item
                        value="with-access"
                        title="Active Portal Users"
                        rightSlot={
                            <StatusBadge
                                status="Active"
                                label={`${withAccess.length} active`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={withAccess}
                            columns={columns}
                            densityMode={densityMode}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => openActionConfirm([row])}
                            actionLabel="Revoke"
                            actionIcon="no_accounts"
                            getRowAction={(row) => ({
                                label: row.status === 'Active' ? 'Revoke' : 'Grant',
                                icon: row.status === 'Active' ? 'no_accounts' : 'person_add',
                                destructive: row.status === 'Active',
                                variant: row.status === 'Active' ? 'secondary' : 'primary',
                                onClick: () => openActionConfirm([row]),
                            })}
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
                        title="Missing Access: Parties"
                        rightSlot={
                            <StatusBadge
                                status="Inactive"
                                label={`${partiesWithout.length} inactive`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={partiesWithout}
                            columns={columns}
                            densityMode={densityMode}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => openActionConfirm([row])}
                            actionLabel="Grant"
                            actionIcon="person_add"
                            getRowAction={(row) => ({
                                label: row.status === 'Active' ? 'Revoke' : 'Grant',
                                icon: row.status === 'Active' ? 'no_accounts' : 'person_add',
                                destructive: row.status === 'Active',
                                variant: row.status === 'Active' ? 'secondary' : 'primary',
                                onClick: () => openActionConfirm([row]),
                            })}
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
                        title="Missing Access: Case Assignments"
                        rightSlot={
                            <StatusBadge
                                status="Inactive"
                                label={`${assignmentsWithout.length} inactive`}
                                showIcon={false}
                            />
                        }
                    >
                        <PortalDataTable
                            data={assignmentsWithout}
                            columns={columns}
                            densityMode={densityMode}
                            rowSelection={selectedIds}
                            onRowSelectionChange={setSelectedIds}
                            onRevokeRow={(row) => openActionConfirm([row])}
                            actionLabel="Grant"
                            actionIcon="person_add"
                            getRowAction={(row) => ({
                                label: row.status === 'Active' ? 'Revoke' : 'Grant',
                                icon: row.status === 'Active' ? 'no_accounts' : 'person_add',
                                destructive: row.status === 'Active',
                                variant: row.status === 'Active' ? 'secondary' : 'primary',
                                onClick: () => openActionConfirm([row]),
                            })}
                            isLoading={isExecuting && assignmentsWithout.length === 0}
                            emptyState={<div className={styles.empty}>No records to display.</div>}
                        />
                    </Accordion.Item>
                </Accordion>
            </div>

            {selectedCount > 0 && densityMode !== 'quick-actions' && (
                <BulkActionFooter
                    selectedCount={selectedCount}
                    onAction={() => {
                        openActionConfirm(selectedRecords);
                    }}
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
                        {pendingAction === 'revoke' ? (
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
                                Are you sure you want to {pendingActionVerb} portal access for <strong>{pendingIds.length} record{pendingIds.length > 1 ? 's' : ''}</strong>?
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
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
