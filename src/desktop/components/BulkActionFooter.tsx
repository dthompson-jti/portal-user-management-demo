import { Button } from '../../components/Button';
import styles from './BulkActionFooter.module.css';

interface BulkActionFooterProps {
    selectedCount: number;
    onAction: () => void;
    onClear: () => void;
    actionLabel?: string;
    actionIcon?: string;
    /** When set, replaces the action button with this message (e.g. mixed-status selection) */
    disabledMessage?: string;
}

export const BulkActionFooter = ({
    selectedCount,
    onAction,
    onClear,
    actionLabel = 'Add comment',
    actionIcon = 'add_comment',
    disabledMessage,
}: BulkActionFooterProps) => {

    return (
        <div className={styles.footer}>
            {/* Count section with dismiss */}
            <div className={styles.countSection}>
                <Button
                    variant="on-solid"
                    size="s"
                    iconOnly
                    onClick={onClear}
                    aria-label="Clear selection"
                >
                    <span className="material-symbols-rounded">close</span>
                </Button>
                <span className={styles.count}>
                    {selectedCount} selected
                </span>
            </div>

            <div className={styles.divider} />

            {disabledMessage ? (
                <span className={styles.disabledMessage}>{disabledMessage}</span>
            ) : (
                <Button
                    variant="on-solid"
                    size="s"
                    onClick={onAction}
                >
                    <span className="material-symbols-rounded">{actionIcon}</span>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
