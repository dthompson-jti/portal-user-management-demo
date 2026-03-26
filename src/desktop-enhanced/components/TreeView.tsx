import React, { useEffect, useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { desktopViewAtom } from '../../desktop/atoms';
import { desktopEnhancedSelectionAtom, desktopEnhancedExpandedNodesAtom, desktopEnhancedTreeLayoutAtom, SelectionType } from '../atoms';
import { TreeGroup, TreeUnit, useTreeData } from '../hooks/useTreeData';

import { Button } from '../../components/Button';
import { Tooltip } from '../../components/Tooltip';
import styles from './TreeView.module.css';

interface TreeItemProps {
    id: string;
    label: string;
    type: 'root' | 'group' | 'unit';
    missed: number;
    secondary: number;
    isExpanded?: boolean;
    isSelected: boolean;
    onToggle?: (e: React.MouseEvent) => void;
    onSelect: () => void;
    depth: number;
    layout: 'indented' | 'full-width';
    children?: React.ReactNode;
}

const TreeItem = React.memo<TreeItemProps & { view: string }>(({
    label,
    type,
    missed,
    secondary,
    isExpanded,
    isSelected,
    onToggle,
    onSelect,
    view,
    depth,
    layout,
    children
}) => {
    const isExpandable = type === 'root' || type === 'group';

    // In full-width mode, we apply padding to the inner content using CSS variable
    // In indented mode, we rely on the nested structure (padding-left on children container)
    const rowStyle = layout === 'full-width'
        ? { '--depth': depth } as React.CSSProperties
        : undefined;

    return (
        <div className={styles.nodeWrapper} data-layout={layout}>
            <div
                className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                onClick={() => onSelect()}
                style={rowStyle}
            >

                {/* Icon Section - Always 24px for alignment */}
                {isExpandable ? (
                    <Button
                        variant="quaternary"
                        size="xs"
                        iconOnly
                        className={styles.chevron}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle?.(e);
                        }}
                    >
                        <span
                            className="material-symbols-rounded"
                            style={{
                                fontSize: 18,
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}
                        >
                            chevron_right
                        </span>
                    </Button>
                ) : (
                    /* Spacer for leaf nodes to align label with parent */
                    <div className={styles.iconSpacer} />
                )}

                {type === 'root' && (
                    <div className={styles.rootIcon}>
                        <span className="material-symbols-rounded">corporate_fare</span>
                    </div>
                )}

                <span className={styles.label}>{label}</span>

                <div className={styles.badges} data-view-mode={view}>
                    <div className={styles.badgeSlot}>
                        {missed > 0 ? (
                            <Tooltip content={view === 'live' ? 'Missed' : 'Missed – no comment'}>
                                <span className={`${styles.badge} ${styles.danger}`}>
                                    {missed}
                                </span>
                            </Tooltip>
                        ) : (
                            <span className={styles.badgePlaceholder} />
                        )}
                    </div>
                    <div className={styles.badgeSlot}>
                        {secondary > 0 ? (
                            <Tooltip content="Due">
                                <span className={`${styles.badge} ${styles.warning}`}>
                                    {secondary}
                                </span>
                            </Tooltip>
                        ) : (
                            <span className={styles.badgePlaceholder} />
                        )}
                    </div>
                </div>
            </div>
            {isExpanded && children && (
                <div className={styles.children}>
                    {children}
                </div>
            )}
        </div>
    );
});


export const TreeView: React.FC = () => {
    const facilityNodes = useTreeData();
    const view = useAtomValue(desktopViewAtom);
    const layout = useAtomValue(desktopEnhancedTreeLayoutAtom);
    const [selection, setSelection] = useAtom(desktopEnhancedSelectionAtom);
    const [expanded, setExpanded] = useAtom(desktopEnhancedExpandedNodesAtom);


    // Auto-expand and select facility root on load
    useEffect(() => {
        if (facilityNodes.length > 0) {
            const rootId = facilityNodes[0].id;

            // Auto-expand if nothing expanded
            if (expanded.size === 0) {
                setExpanded(new Set([rootId]));
            }

            // Auto-select if nothing selected
            if (!selection.id || selection.id === 'root') {
                setSelection({ type: 'root', id: rootId });
            }
        }
    }, [facilityNodes, expanded.size, setExpanded, selection.id, setSelection]);

    const toggleExpand = useCallback((id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, [setExpanded]);

    const selectNode = useCallback((type: SelectionType, id: string, parentId?: string) => {
        setSelection({ type, id, parentId });
    }, [setSelection]);

    const renderNode = (node: TreeGroup | TreeUnit, depth: number = 0) => {
        const isSelected = selection.id === node.id;

        const isExpanded = expanded.has(node.id);

        return (
            <TreeItem
                key={`${node.type}-${node.id}`}
                id={node.id}
                label={node.name}
                type={node.type}
                missed={node.missed}
                secondary={node.secondary}
                isSelected={isSelected}
                isExpanded={isExpanded}
                view={view}
                onToggle={() => toggleExpand(node.id)}
                onSelect={() => selectNode(node.type, node.id, 'parentId' in node ? node.parentId : undefined)}
                depth={depth}
                layout={layout}
            >
                {'children' in node && node.children?.map((child) => renderNode(child, depth + 1))}
            </TreeItem>
        );
    };

    return (
        <div className={styles.tree} data-layout={layout}>
            {facilityNodes.map(node => renderNode(node, 0))}
        </div>
    );
};

