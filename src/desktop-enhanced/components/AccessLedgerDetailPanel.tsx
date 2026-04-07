import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { isDetailPanelOpenAtom, panelWidthAtom } from '../../desktop/atoms';
import { portalInspectedRecordAtom, portalSelectedCountAtom } from '../atoms';
import { useTerminology } from '../hooks/useTerminology';
import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { LabelValueRow } from '../../components/LabelValueRow';
import { SidePanelHeading } from '../../desktop/components/SidePanelHeading';
import panelStyles from '../../desktop/components/DetailPanel.module.css';
import styles from './AccessLedger.module.css';

interface AccessLedgerDetailPanelProps {
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
}

export const AccessLedgerDetailPanel = ({ onResizeStart, onResizeEnd }: AccessLedgerDetailPanelProps) => {
    const record = useAtomValue(portalInspectedRecordAtom);
    const selectedCount = useAtomValue(portalSelectedCountAtom);
    const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);
    const terminology = useTerminology();

    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef(panelWidth);

    useLayoutEffect(() => {
        document.documentElement.style.setProperty('--panel-width', `${panelWidth}px`);
    }, [panelWidth]);

    const handleClose = () => {
        setPanelOpen(false);
    };

    // Resize handlers (same pattern as DetailPanel)
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        onResizeStart?.();
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
        }
    }, [onResizeStart]);

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        const clampedWidth = Math.max(260, Math.min(450, newWidth));
        widthRef.current = clampedWidth;
        document.documentElement.style.setProperty('--panel-width', `${clampedWidth}px`);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        onResizeEnd?.();
        if (panelRef.current) {
            panelRef.current.style.transition = '';
            setPanelWidth(widthRef.current);
        }
    }, [setPanelWidth, onResizeEnd]);

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

    const panelVariants = {
        closed: { x: '100%' },
        open: { x: 0 },
    };

    const transition = {
        type: 'tween' as const,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        duration: 0.3,
    };

    return (
        <motion.div
            ref={panelRef}
            className={panelStyles.panel}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            transition={transition}
        >
            {/* Resize Handle */}
            <div
                className={`${panelStyles.resizeHandle} ${isResizing ? panelStyles.active : ''}`}
                onMouseDown={handleResizeStart}
            >
                <div className={panelStyles.resizeIndicator} />
            </div>

            {/* Header */}
            <div className={panelStyles.header}>
                <div className={panelStyles.titleGroup}>
                    <h3 className={panelStyles.residentName}>
                        {record
                            ? record.caseName
                            : selectedCount > 1
                                ? `${selectedCount} selected`
                                : 'No selection'
                        }
                    </h3>
                </div>
                <div className={panelStyles.headerActions}>
                    <Tooltip content="Close panel">
                        <Button
                            variant="tertiary"
                            size="s"
                            iconOnly
                            aria-label="Close panel"
                            onClick={handleClose}
                        >
                            <span className="material-symbols-rounded">close</span>
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Content */}
            <div className={panelStyles.content}>
                {!record ? (
                    <div className={panelStyles.emptyState}>
                        <span className={`material-symbols-rounded ${panelStyles.placeholderIcon}`}>
                            {selectedCount > 1 ? 'select_all' : 'touch_app'}
                        </span>
                        <h4 className={panelStyles.emptyTitle}>
                            {selectedCount > 1 ? 'Multiple items selected' : 'Select a record to see details'}
                        </h4>
                    </div>
                ) : (
                    <>
                        {/* Section: Case */}
                        <div className={panelStyles.section}>
                            <SidePanelHeading title="Case" />
                            <div className={panelStyles.metaStack}>
                                <LabelValueRow label="Case number" value={record.caseNumber} />
                                <LabelValueRow label="Case name" value={record.caseName} />
                                <LabelValueRow label="Case type" value={record.caseType} />
                                <LabelValueRow
                                    label={terminology.columnHeader}
                                    value={
                                        <span className={styles.badge} data-status={record.status}>
                                            {terminology.getStatusLabel(record.status)}
                                        </span>
                                    }
                                />
                            </div>
                        </div>

                        {/* Section: Participant */}
                        <div className={panelStyles.section}>
                            <SidePanelHeading title="Participant" />
                            <div className={panelStyles.metaStack}>
                                <LabelValueRow label="Email" value={record.email} />
                                <LabelValueRow label="Role" value={record.participantRole} />
                                <LabelValueRow label="Access type" value={record.accessType} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={panelStyles.actionGroup}>
                            {record.status === 'Active' && (
                                <Button variant="secondary" size="s">
                                    <span className="material-symbols-rounded">no_accounts</span>
                                    Revoke access
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
};
