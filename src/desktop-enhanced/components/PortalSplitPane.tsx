import React, { useState, useMemo, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    portalResultsAtom,
    isPortalActionExecutingAtom,
    splitPaneSearchModeAtom,
    splitPaneSelectedItemAtom,
    splitPaneWidthAtom,
} from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import { PortalDataTable } from './PortalDataTable';
import { PortalCaseAccessManager } from './PortalCaseAccessManager';
import { SplitPaneToggle } from './SplitPaneToggle';
import { SplitPaneBrowseList } from './SplitPaneBrowseList';
import { StatusBadge, StatusBadgeType } from '../../desktop/components/StatusBadge';
import { BulkActionFooter } from '../../desktop/components/BulkActionFooter';
import { addToastAtom } from '../../data/toastAtoms';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import styles from './PortalSplitPane.module.css';

const getPortalAccessBadgeLabel = (status: string) => status === 'Active' ? 'Portal access' : 'No Portal access';
const renderEmailValue = (email: string) => email.trim() || 'Email address not provided';

/** Right-pane detail when an email is selected — shows all cases for that person */
const EmailDetailView: React.FC<{ email: string }> = ({ email }) => {
    const [results, setResults] = useAtom(portalResultsAtom);
    const [isExecuting, setIsExecuting] = useAtom(isPortalActionExecutingAtom);
    const addToast = useSetAtom(addToastAtom);

    const [selectedIds, setSelectedIds] = useState<RowSelectionState>({});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingIds, setPendingIds] = useState<string[]>([]);

    const records = useMemo(
        () => results.filter(r => r.email === email),
        [results, email]
    );

    const columns: ColumnDef<PortalAccessRecord, unknown>[] = useMemo(() => [
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
    ], []);

    const handleBulkAction = async () => {
        const ids = pendingIds;
        if (ids.length === 0) return;

        setIsExecuting(true);
        await new Promise(r => setTimeout(r, 1200));

        const selected = records.filter(r => ids.includes(r.id));
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

    const selectedCount = Object.keys(selectedIds).filter(k => selectedIds[k]).length;
    const selectedRecords = records.filter(r => selectedIds[r.id]);
    const isRevokeMode = selectedRecords.some(r => r.status === 'Active');

    const isMixedSelection = useMemo(() => {
        if (selectedCount < 2) return false;
        const statuses = new Set(selectedRecords.map(r => r.status));
        return statuses.size > 1;
    }, [selectedCount, selectedRecords]);

    return (
        <div className={styles.emailDetail}>
            <div className={styles.emailDetailHeader}>
                <span className={`material-symbols-rounded ${styles.emailIcon}`}>mail</span>
                <h3 className={styles.emailTitle}>{renderEmailValue(email)}</h3>
            </div>

            <PortalDataTable
                data={records}
                columns={columns}
                rowSelection={selectedIds}
                onRowSelectionChange={setSelectedIds}
                onRevokeRow={(row) => {
                    setPendingIds([row.id]);
                    setIsConfirmOpen(true);
                }}
                actionLabel={isRevokeMode ? 'Revoke' : 'Grant'}
                actionIcon={isRevokeMode ? 'no_accounts' : 'person_add'}
                emptyState={<div className={styles.empty}>No records found for this email.</div>}
            />

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
                    <Button variant="tertiary" size="s" iconOnly onClick={() => setIsConfirmOpen(false)} disabled={isExecuting}>
                        <span className="material-symbols-rounded">close</span>
                    </Button>
                </Modal.Header>
                <Modal.Content>
                    <div className={styles.confirmBody}>
                        {isRevokeMode && (
                            <div className={styles.warningBanner}>
                                <span className={`material-symbols-rounded ${styles.warningIcon}`}>warning</span>
                                <span>Access will be removed from the selected records. You can add access again later if needed.</span>
                            </div>
                        )}
                        <p className={styles.confirmText}>
                            Are you sure you want to {isRevokeMode ? 'revoke' : 'grant'} portal access for <strong>{pendingIds.length} record{pendingIds.length > 1 ? 's' : ''}</strong>?
                        </p>
                    </div>
                </Modal.Content>
                <Modal.Footer>
                    <div className={styles.footerActions}>
                        <Button variant="primary" size="m" onClick={() => { void handleBulkAction(); }} loading={isExecuting}>
                            {isRevokeMode ? 'Revoke access' : 'Grant access'}
                        </Button>
                        <Button variant="secondary" size="m" onClick={() => setIsConfirmOpen(false)} disabled={isExecuting}>
                            Cancel
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

/** Main split-pane container */
export const PortalSplitPane: React.FC = () => {
    const mode = useAtomValue(splitPaneSearchModeAtom);
    const selectedItem = useAtomValue(splitPaneSelectedItemAtom);
    const [paneWidth, setPaneWidth] = useAtom(splitPaneWidthAtom);

    // Resize state
    const [isResizing, setIsResizing] = useState(false);
    const widthRef = useRef(paneWidth);
    const leftPaneRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        document.documentElement.style.setProperty('--split-left-pane-width', `${paneWidth}px`);
    }, [paneWidth]);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        if (leftPaneRef.current) {
            leftPaneRef.current.style.transition = 'none';
        }
    }, []);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        // Left pane: width = mouse X minus the left edge of the split pane
        const container = leftPaneRef.current?.parentElement;
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        const clampedWidth = Math.max(280, Math.min(400, newWidth));
        widthRef.current = clampedWidth;
        document.documentElement.style.setProperty('--split-left-pane-width', `${clampedWidth}px`);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        if (leftPaneRef.current) {
            leftPaneRef.current.style.transition = '';
            setPaneWidth(widthRef.current);
        }
    }, [setPaneWidth]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing, handleResizeMove, handleResizeEnd]);

    const renderRightPane = () => {
        if (!selectedItem) {
            return (
                <div className={styles.emptyState}>
                    <span className={`material-symbols-rounded ${styles.emptyIcon}`}>
                        {mode === 'email' ? 'mail' : 'folder_open'}
                    </span>
                    <p>Select {mode === 'email' ? 'an email' : 'a case'} to manage portal access.</p>
                </div>
            );
        }

        if (mode === 'email') {
            return <EmailDetailView key={selectedItem} email={selectedItem} />;
        }

        return <PortalCaseAccessManager key={selectedItem} caseNum={selectedItem} compact />;
    };

    return (
        <div className={styles.splitPaneContainer}>
            <div
                ref={leftPaneRef}
                className={styles.leftPane}
                style={{ width: `var(--split-left-pane-width, ${paneWidth}px)` }}
            >
                <div className={styles.header}>
                    <h2>Portal Access</h2>
                </div>
                <SplitPaneToggle />
                <SplitPaneBrowseList />
            </div>

            <div
                className={styles.resizeHandle}
                onMouseDown={handleResizeStart}
            />

            <div className={styles.rightPane}>
                {renderRightPane()}
            </div>
        </div>
    );
};
