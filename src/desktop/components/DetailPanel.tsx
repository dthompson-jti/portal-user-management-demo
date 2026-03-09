import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { motion } from 'framer-motion';
import {
    supervisorNoteModalAtom,
    isDetailPanelOpenAtom,
    PanelData,
    panelWidthAtom,
    residentBadgeColorModeAtom,
    selectedLiveRowsAtom,
    selectedHistoryRowsAtom
} from '../atoms';
import { StatusBadge, StatusBadgeType } from './StatusBadge';

import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import { LabelValueRow } from '../../components/LabelValueRow';
import { LinkButton } from '../../components/LinkButton';
import { SidePanelHeading } from './SidePanelHeading';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
    record: PanelData | null;
    selectedCount?: number;
    onResizeStart?: () => void;
    onResizeEnd?: () => void;
}

export const DetailPanel = ({ record, selectedCount = 0, onResizeStart, onResizeEnd }: DetailPanelProps) => {
    // State management
    const [panelWidth, setPanelWidth] = useAtom(panelWidthAtom);
    const setPanelOpen = useSetAtom(isDetailPanelOpenAtom);
    const setModalState = useSetAtom(supervisorNoteModalAtom);

    // Performance refs: track width during drag without re-rendering DetailPanel
    const [isResizing, setIsResizing] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const widthRef = useRef(panelWidth);

    // Derived state
    const colorMode = useAtomValue(residentBadgeColorModeAtom);


    // Sync initial width to CSS variable
    useLayoutEffect(() => {
        document.documentElement.style.setProperty('--panel-width', `${panelWidth}px`);
    }, [panelWidth]);





    const setLiveSelection = useSetAtom(selectedLiveRowsAtom);
    const setHistorySelection = useSetAtom(selectedHistoryRowsAtom);

    const handleClose = () => {
        setPanelOpen(false);
        // Clear selection on manual close to match desired behavior
        setLiveSelection(new Set());
        setHistorySelection(new Set());
    };

    const handleOpenNoteModal = () => {
        if (!record) return;
        setModalState({
            isOpen: true,
            selectedIds: [record.id],
        });
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>;
        const date = new Date(iso);
        if (isNaN(date.getTime())) return iso;
        return date.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    // Resize handlers
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

        // Direct update (matches Left panel). The transition: none fix is the key.
        widthRef.current = clampedWidth;
        document.documentElement.style.setProperty('--panel-width', `${clampedWidth}px`);
    }, [isResizing]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        onResizeEnd?.();
        if (panelRef.current) {
            panelRef.current.style.transition = '';
            // Sync Jotai state once dragging stops
            setPanelWidth(widthRef.current);
        }
    }, [setPanelWidth, onResizeEnd]);

    // Add/remove global listeners for resize
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

    const isLive = record?.source === 'live';
    const headerTitle = isLive
        ? record?.location
        : (record?.residents.length && record.residents.length > 1 ? `${record.residents.length} residents` : record?.residentName);

    return (
        <motion.div
            ref={panelRef}
            className={styles.panel}
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
            transition={transition}
        >
            {/* Resize Handle */}
            <div
                className={`${styles.resizeHandle} ${isResizing ? styles.active : ''}`}
                onMouseDown={handleResizeStart}
            >
                <div className={styles.resizeIndicator} />
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    {record ? (
                        <h3 className={styles.residentName}>
                            {headerTitle}
                        </h3>
                    ) : (
                        <h3 className={styles.residentName}>
                            {selectedCount > 1 ? `${selectedCount} selected` : 'No selection'}
                        </h3>
                    )}
                </div>
                <div className={styles.headerActions}>

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

            <div className={styles.content}>
                {!record ? (
                    <div className={styles.emptyState}>
                        <span className={`material-symbols-rounded ${styles.placeholderIcon}`}>
                            {selectedCount > 1 ? 'select_all' : 'touch_app'}
                        </span>
                        <h4 className={styles.emptyTitle}>
                            {selectedCount > 1 ? 'Multiple items selected' : 'Select an item to see the details'}
                        </h4>
                    </div>
                ) : (
                    <>
                        {/* SECTION 1: DETAILS */}
                        <div className={styles.section}>
                            <SidePanelHeading title="Details" />
                            <div className={styles.metaStack}>
                                <LabelValueRow
                                    label={isLive || record.residents.length > 1 ? 'Residents' : 'Resident'}
                                    value={
                                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            {record.residents.map((r, i) => {
                                                // Extract badges (Duplicate logic effectively, but localized for styling)
                                                // Ideally we'd have a helper, but inline is fastest for this unique layout
                                                interface BadgeItem { label: string; status: StatusBadgeType; }
                                                const badges: BadgeItem[] = [];
                                                if (r.hasHighRisk) badges.push({ label: 'Suicide Risk', status: 'special' });
                                                if (r.hasMedicalWatch) badges.push({ label: 'Medical Watch', status: 'special' });
                                                if (r.otherRisks) r.otherRisks.forEach(risk => badges.push({ label: risk, status: 'special' }));

                                                return (
                                                    <div key={i} className={styles.locationTree} style={{ marginBottom: i < record.residents.length - 1 ? (badges.length > 0 ? '12px' : '4px') : 0 }}>
                                                        {/* Root: Name */}
                                                        <div className={styles.treeNode}>
                                                            <LinkButton
                                                                label={r.name}
                                                                variant="primary"
                                                                external
                                                                onClick={() => { }}
                                                            />
                                                        </div>

                                                        {/* Children: Badges (Grouped in one L-bracket) */}
                                                        {badges.length > 0 && (
                                                            <div className={styles.treeNode} style={{ alignItems: 'flex-start', paddingLeft: '16px' }}>
                                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px', marginLeft: '0px' }}>
                                                                    {badges.map((b, bi: number) => (
                                                                        <StatusBadge
                                                                            key={bi}
                                                                            status={b.status}
                                                                            label={b.label}
                                                                            fill
                                                                            colorMode={colorMode}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    }
                                />
                                <LabelValueRow
                                    label="Location"
                                    value={
                                        <div className={styles.locationTree}>
                                            {/* Root: Facility */}
                                            <div className={styles.treeNode} data-depth="0">
                                                <div className={styles.treeIcon}>
                                                    <span className="material-symbols-rounded">domain</span>
                                                </div>
                                                <LinkButton variant="primary" label="Northwood JDC" external onClick={() => { }} />
                                            </div>

                                            {/* Level 1: Group */}
                                            <div className={styles.treeNode} data-depth="1">
                                                <div className={styles.treeBend} />
                                                <div className={styles.treeIcon}>
                                                    <span className="material-symbols-rounded">corporate_fare</span>
                                                </div>
                                                <LinkButton variant="primary" label={record.group || '—'} external onClick={() => { }} />
                                            </div>

                                            {/* Level 2: Unit */}
                                            <div className={styles.treeNode} data-depth="2">
                                                <div className={styles.treeBend} />
                                                <div className={styles.treeIcon}>
                                                    <span className="material-symbols-rounded">view_cozy</span>
                                                </div>
                                                <LinkButton variant="primary" label={record.unit || '—'} external onClick={() => { }} />
                                            </div>

                                            {/* Level 3: Room (Text Only) */}
                                            <div className={styles.treeNode} data-depth="3">
                                                <div className={styles.treeBend} />
                                                <div className={styles.treeIcon}>
                                                    <span className="material-symbols-rounded">door_front</span>
                                                </div>
                                                <span className={styles.plainTextValue}>{record.location}</span>
                                            </div>
                                        </div>
                                    }
                                />
                                <LabelValueRow
                                    label="Status"
                                    value={<StatusBadge status={record.status as StatusBadgeType} />}
                                />
                                <LabelValueRow
                                    label="Scheduled"
                                    value={formatTime(record.scheduledEndTime || record.timeScheduled)}
                                />
                                {!isLive && (
                                    <LabelValueRow
                                        label="Actual"
                                        value={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {formatTime(record.completedTime || record.timeActual)}
                                                {record.roomIdMethod && (
                                                    <span style={{
                                                        fontSize: 'var(--font-size-sm)',
                                                        color: 'var(--surface-fg-tertiary)',
                                                        fontWeight: 'var(--font-weight-regular)',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        (via {record.roomIdMethod === 'QR_CODE' ? 'QR code' : record.roomIdMethod === 'NFC' ? 'NFC' : record.roomIdMethod.replace('_', ' ').toLowerCase()})
                                                    </span>
                                                )}
                                            </div>
                                        }
                                    />
                                )}
                                {!isLive && (
                                    <LabelValueRow
                                        label="Officer"
                                        value={record.officerName || <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>}
                                    />
                                )}
                                {!isLive && (
                                    <LabelValueRow
                                        label="Officer comments"
                                        value={record.officerNote || <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>}
                                    />
                                )}
                            </div>
                        </div>


                        {/* SECTION 3: SUPERVISOR COMMENT - HIDDEN IN LIVE VIEW */}
                        {!isLive && (
                            <div className={styles.section}>
                                <SidePanelHeading title="Supervisor review" />
                                <div className={styles.metaStack}>
                                    <LabelValueRow
                                        label="Date"
                                        value={formatTime(record.reviewDate || null)}
                                    />
                                    <LabelValueRow
                                        label="Supervisor"
                                        value={record.supervisorName || <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>}
                                    />
                                    <LabelValueRow
                                        label="Reason"
                                        value={record.supervisorNote || <span style={{ color: 'var(--control-fg-placeholder)' }}>—</span>}
                                    />
                                </div>
                                <div className={styles.actionGroup}>
                                    <Button
                                        variant="secondary"
                                        size="s"
                                        onClick={handleOpenNoteModal}
                                    >
                                        <span className="material-symbols-rounded">{record.supervisorNote ? 'edit_note' : 'add_comment'}</span>
                                        {record.supervisorNote ? 'Edit review' : 'Add review'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};
