// src/desktop/components/SupervisorNoteModal.tsx

import { useState, useMemo } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import {
    supervisorNoteModalAtom,
    historicalChecksAtom,
    selectedHistoryRowsAtom,
    historicalRefreshAtom,
    activeDetailRecordAtom,
    requireSupervisorNoteReasonAtom,
    reasonSelectionModeAtom,
} from '../atoms';
import { SUPERVISOR_NOTE_REASONS, SupervisorNoteReason } from '../types';
import { addToastAtom } from '../../data/toastAtoms';
import { updateHistoricalCheck } from '../../desktop-enhanced/data/mockData';
import { Modal } from '../../components/Modal';
import { Select, SelectItem } from '../../components/Select';
import { Button } from '../../components/Button';
import styles from './SupervisorNoteModal.module.css';

/**
 * SupervisorNoteModal
 * 
 * ARCHITECTURAL INVARIANT:
 * - Multi-edit state ("Updating N records") MUST be displayed in an info banner within the modal body.
 * - The banner uses semantic info tokens (`--surface-bg-info`, etc.) and is positioned above form fields.
 */
export const SupervisorNoteModal = () => {
    const [modalState, setModalState] = useAtom(supervisorNoteModalAtom);
    const historicalChecks = useAtomValue(historicalChecksAtom);
    const setHistoricalChecks = useSetAtom(historicalChecksAtom);
    const setSelectedRows = useSetAtom(selectedHistoryRowsAtom);
    const setRefreshTrigger = useSetAtom(historicalRefreshAtom);
    const addToast = useSetAtom(addToastAtom);
    const requireReason = useAtomValue(requireSupervisorNoteReasonAtom);
    const selectionMode = useAtomValue(reasonSelectionModeAtom);

    const [reason, setReason] = useState<SupervisorNoteReason | ''>('Unspecified'); // Strict mode needs empty str
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    // Initial load / Edit mode logic
    const [hasExistingComment, setHasExistingComment] = useState(false);

    // Sync state when modal opens
    useMemo(() => {
        if (!modalState.isOpen) return;

        const isMulti = modalState.selectedIds.length > 1;

        if (isMulti) {
            // Simplified: always empty for multiple
            setHasExistingComment(false);
            setReason('');
            setAdditionalNotes('');
            return;
        }

        // Find the check (single selection)
        const selectedChecks = historicalChecks.filter((c: { id: string }) => modalState.selectedIds.includes(c.id));
        const existingNoteCheck = selectedChecks.find((c: { supervisorNote?: string }) => !!c.supervisorNote);

        if (existingNoteCheck && existingNoteCheck.supervisorNote) {
            setHasExistingComment(true);

            // Try to parse: "Reason - Notes"
            const parts = existingNoteCheck.supervisorNote.split(' - ');
            const potentialReason = parts[0] as SupervisorNoteReason;

            if (SUPERVISOR_NOTE_REASONS.includes(potentialReason)) {
                setReason(potentialReason);
                setAdditionalNotes(parts.slice(1).join(' - '));
            } else {
                setReason('Other');
                setAdditionalNotes(existingNoteCheck.supervisorNote);
            }
        } else {
            setHasExistingComment(false);
            // Always start with empty string (placeholder) when no existing comment
            setReason('');
            setAdditionalNotes('');
        }
    }, [modalState.isOpen, modalState.selectedIds, historicalChecks]);

    const handleClose = () => {
        if (isSaving) return;
        setModalState({ isOpen: false, selectedIds: [] });
        setReason('');
        setAdditionalNotes('');
        setHasExistingComment(false);
        setShowDeleteConfirm(false);
        setShowBulkConfirm(false);
    };

    const handleConfirmClose = () => {
        if (isSaving) return;
        setShowDeleteConfirm(false);
    };

    const handleBulkConfirmClose = () => {
        if (isSaving) return;
        setShowBulkConfirm(false);
    };

    const [activeRecord, setActiveRecord] = useAtom(activeDetailRecordAtom);

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);

        const currentReason = reason || 'Unspecified';
        const note = additionalNotes
            ? `${currentReason} - ${additionalNotes}`
            : currentReason;

        const updates = {
            supervisorNote: note,
            supervisorName: 'Dave Thompson', // Mock logged-in user
            reviewDate: new Date().toISOString(),
            reviewStatus: 'verified' as const,
            supervisorReview: {
                id: `rev-${modalState.selectedIds[0]}-${Date.now()}`,
                safetyCheckId: modalState.selectedIds[0],
                reason: currentReason,
                notes: additionalNotes,
                reviewedById: 'u-dthompson',
                reviewedDate: new Date().toISOString()
            }
        };

        try {
            await updateHistoricalCheck(modalState.selectedIds, updates);
            // ... rest remains same but logic should ideally use the object
            setHistoricalChecks((checks) =>
                checks.map((check) =>
                    modalState.selectedIds.includes(check.id) ? { ...check, ...updates } : check
                )
            );

            // Sync active record if it's the one being edited
            // This ensures the Detail Panel updates immediately without requiring a full re-select/refresh
            if (activeRecord && modalState.selectedIds.includes(activeRecord.id)) {
                setActiveRecord({ ...activeRecord, ...updates });
            }

            if (modalState.selectedIds.length > 1) {
                setSelectedRows(new Set());
            }

            addToast({
                title: 'Supervisor review saved',
                message: `Applied to ${modalState.selectedIds.length} check${modalState.selectedIds.length !== 1 ? 's' : ''}`,
                icon: 'check_circle',
                variant: 'success',
            });

            handleClose();
        } catch (error) {
            console.error('Failed to save review:', error);
            addToast({ title: 'Error', message: 'Failed to save supervisor review.', icon: 'error', variant: 'alert' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (targetIds: string[]) => {
        if (isSaving) return;
        setIsSaving(true);

        const updates = {
            supervisorNote: undefined,
            supervisorName: undefined,
            reviewDate: undefined,
            reviewStatus: 'pending' as const,
        };

        try {
            await updateHistoricalCheck(targetIds, updates);
            setHistoricalChecks((checks) =>
                checks.map((check) =>
                    targetIds.includes(check.id) ? { ...check, ...updates } : check
                )
            );

            // Sync active record if it's the one being edited
            if (activeRecord && targetIds.includes(activeRecord.id)) {
                setActiveRecord({ ...activeRecord, ...updates });
            }

            setRefreshTrigger(prev => prev + 1);

            // Always refresh selection state
            if (modalState.selectedIds.length > 1) {
                setSelectedRows(new Set());
            }

            addToast({
                title: 'Supervisor review removed',
                message: `Cleared from ${targetIds.length} check${targetIds.length !== 1 ? 's' : ''}`,
                icon: 'info',
                variant: 'info',
            });

            handleClose();
        } catch (error) {
            console.error('Failed to remove review:', error);
            addToast({ title: 'Error', message: 'Failed to remove supervisor review.', icon: 'error', variant: 'alert' });
        } finally {
            setIsSaving(false);
        }
    };

    // Checks in the current selection that actually have a review — drives Remove button + confirmation copy
    const checksWithReviews = historicalChecks.filter(
        (c) => modalState.selectedIds.includes(c.id) && !!c.supervisorNote
    );

    // For the prototype, we want to see the options even in strict mode if they are the chosen pattern
    // However, we must avoid duplicates.
    const visibleReasons = SUPERVISOR_NOTE_REASONS.filter(r => r !== 'Unspecified');

    // Validation for Save button
    const isReasonMissing = requireReason && !reason;
    const isOtherMissingNote = reason === 'Other' && !additionalNotes.trim();
    const isSaveDisabled = isSaving || isReasonMissing || isOtherMissingNote;

    return (
        <>
        <Modal
            isOpen={modalState.isOpen}
            onClose={handleClose}
            title={hasExistingComment ? "Edit supervisor review" : "Add supervisor review"}
            width="440px"
        >
            <Modal.Header>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>{hasExistingComment ? "Edit supervisor review" : "Add supervisor review"}</span>
                </div>
                <Button variant="tertiary" size="s" iconOnly aria-label="Close" onClick={handleClose} disabled={isSaving}>
                    <span className="material-symbols-rounded">close</span>
                </Button>
            </Modal.Header>

            <Modal.Content>
                <div className={styles.body}>
                    {modalState.selectedIds.length > 1 && (
                        <div className={styles.multiEditLabel}>
                            Updating {modalState.selectedIds.length} records
                        </div>
                    )}
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Reason for missed check(s)
                            {requireReason && <span style={{ color: 'var(--surface-fg-alert-primary)', marginLeft: '4px' }}>*</span>}
                        </label>
                        <div className={styles.selectFieldContainer}>
                            <Select
                                value={reason}
                                onValueChange={(val) => {
                                    if (val === '_clear' || val === 'none') setReason('');
                                    else setReason(val as SupervisorNoteReason);
                                }}
                                placeholder="Select a reason..."
                                disabled={isSaving}
                                triggerClassName={styles.fullWidth}
                            >
                                {selectionMode === 'ghost' && (
                                    <SelectItem value="_clear">{"\u00A0"}</SelectItem>
                                )}
                                {selectionMode === 'none' && (
                                    <SelectItem value="_clear">None</SelectItem>
                                )}
                                {visibleReasons.map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                                {(!requireReason && selectionMode === 'inline') && (
                                    <SelectItem value="_clear">{"\u00A0"}</SelectItem>
                                )}
                            </Select>

                            {selectionMode === 'inline' && reason && (
                                <Button
                                    variant="quaternary"
                                    size="s"
                                    iconOnly
                                    className={styles.inlineClearButton}
                                    onClick={() => setReason('')}
                                    aria-label="Clear reason"
                                >
                                    <span className="material-symbols-rounded">close</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Additional notes</label>
                        <textarea
                            className={styles.textarea}
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Enter additional context..."
                            rows={3}
                            disabled={isSaving}
                        />
                    </div>


                </div>
            </Modal.Content>

            <Modal.Footer>
                <div className={styles.footerActions}>
                    {checksWithReviews.length > 0 && (
                        <div style={{ marginRight: 'auto' }}>
                            <Button
                                variant="secondary"
                                size="m"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={isSaving}
                            >
                                Remove review
                            </Button>
                        </div>
                    )}
                    <Button
                        variant="primary"
                        className={styles.saveButton}
                        onClick={() => {
                            if (modalState.selectedIds.length > 1) {
                                setShowBulkConfirm(true);
                            } else {
                                void handleSave();
                            }
                        }}
                        size="m"
                        loading={isSaving}
                        disabled={isSaveDisabled}
                    >
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        className={styles.cancelButton}
                        size="m"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>

        <Modal
            isOpen={showDeleteConfirm}
            onClose={handleConfirmClose}
            title="Remove review"
            width="360px"
            nested
        >
            <Modal.Header>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>Remove review</span>
                </div>
                <Button variant="tertiary" size="s" iconOnly aria-label="Close" onClick={handleConfirmClose} disabled={isSaving}>
                    <span className="material-symbols-rounded">close</span>
                </Button>
            </Modal.Header>
            <Modal.Content>
                {(() => {
                    const count = checksWithReviews.length;
                    const total = modalState.selectedIds.length;
                    const isPartial = count < total;
                    const residentName = count === 1 ? checksWithReviews[0]?.residents?.[0]?.name : null;

                    return (
                        <div className={styles.confirmBody}>
                            <div className={styles.warningBannerYellow}>
                                <span className={`material-symbols-rounded ${styles.warningBannerIconYellow}`}>warning</span>
                                <span>
                                    {isPartial
                                        ? `${count} of your ${total} selected checks have a review. Only those will be cleared.`
                                        : 'This will clear the supervisor note and revert the check to unreviewed.'
                                    }
                                </span>
                            </div>
                            <p className={styles.confirmText}>
                                Are you sure you want to remove the review for{' '}
                                {residentName
                                    ? <><strong>{residentName}</strong>?</>
                                    : <><strong>{count} check{count !== 1 ? 's' : ''}</strong>?</>
                                }
                            </p>
                        </div>
                    );
                })()}
            </Modal.Content>
            <Modal.Footer>
                <div className={styles.footerActions}>
                    <Button
                        variant="primary"
                        size="m"
                        onClick={() => { void handleDelete(checksWithReviews.map(c => c.id)); }}
                        loading={isSaving}
                        disabled={isSaving}
                    >
                        Remove review
                    </Button>
                    <Button variant="secondary" size="m" onClick={handleConfirmClose} disabled={isSaving}>
                        Cancel
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>

        <Modal
            isOpen={showBulkConfirm}
            onClose={handleBulkConfirmClose}
            title="Apply review"
            width="360px"
            nested
        >
            <Modal.Header>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>Apply review</span>
                </div>
                <Button variant="tertiary" size="s" iconOnly aria-label="Close" onClick={handleBulkConfirmClose} disabled={isSaving}>
                    <span className="material-symbols-rounded">close</span>
                </Button>
            </Modal.Header>
            <Modal.Content>
                <p className={styles.confirmText}>
                    Are you sure you want to apply this review to{' '}
                    <strong>{modalState.selectedIds.length} checks</strong>?
                </p>
            </Modal.Content>
            <Modal.Footer>
                <div className={styles.footerActions}>
                    <Button
                        variant="primary"
                        size="m"
                        onClick={() => { setShowBulkConfirm(false); void handleSave(); }}
                        loading={isSaving}
                        disabled={isSaving}
                    >
                        Apply review
                    </Button>
                    <Button variant="secondary" size="m" onClick={handleBulkConfirmClose} disabled={isSaving}>
                        Cancel
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
        </>
    );
};
