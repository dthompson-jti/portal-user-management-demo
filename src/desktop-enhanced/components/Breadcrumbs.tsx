import { useAtom } from 'jotai';
import { desktopEnhancedSelectionAtom, SelectionType } from '../atoms';
import { TreeGroup, TreeUnit, useTreeData } from '../hooks/useTreeData';
import { trackEvent } from '../../analytics';
import styles from './Breadcrumbs.module.css';

export const Breadcrumbs = () => {
    const [selection, setSelection] = useAtom(desktopEnhancedSelectionAtom);
    const groups = useTreeData();

    // Helper to find names and build navigation paths
    const getParts = () => {
        const root = groups[0];
        if (!root) return [];

        const parts = [{ name: root.name, id: root.id, type: root.type as SelectionType }];

        if (selection.type === 'root') {
            return parts;
        }

        if (selection.type === 'group') {
            const group = root.children.find(g => g.id === selection.id);
            if (group) parts.push({ name: group.name, id: group.id, type: group.type as SelectionType });
            return parts;
        }

        if (selection.type === 'unit') {
            const group = root.children.find(g => 'children' in g && g.children.some(u => u.id === selection.id)) as TreeGroup | undefined;
            const unit = group?.children.find((u) => u.id === selection.id) as TreeUnit | undefined;
            if (group) parts.push({ name: group.name, id: group.id, type: group.type as SelectionType });
            if (unit) parts.push({ name: unit.name, id: unit.id, type: unit.type as SelectionType });
            return parts;
        }
        return parts;
    };

    const parts = getParts();

    const handleBreadcrumbClick = (part: { name: string, id: string, type: SelectionType }) => {
        trackEvent('breadcrumb_navigated', {
            target_id: part.id,
            target_type: part.type,
            target_name: part.name,
            current_selection_type: selection.type
        });
        setSelection({ type: part.type, id: part.id });
    };

    return (
        <div className={styles.breadcrumbs}>
            <div className={styles.parts}>
                {parts.map((part, index) => (
                    <div key={index} className={styles.part}>
                        <button
                            className={styles.text}
                            onClick={() => handleBreadcrumbClick(part)}
                        >
                            {part.name}
                        </button>
                        {index < parts.length - 1 && (
                            <span className={`material-symbols-rounded ${styles.chevron}`}>
                                chevron_right
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
