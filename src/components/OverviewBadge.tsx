import React from 'react';
import styles from './OverviewBadge.module.css';

type BadgeVariant = 'success' | 'alert' | 'warning' | 'info';

interface OverviewBadgeProps {
    icon: string;
    label: string;
    value: string;
    variant: BadgeVariant;
    className?: string;
}

export const OverviewBadge: React.FC<OverviewBadgeProps> = ({
    icon,
    label,
    value,
    variant,
    className = '',
}) => {
    return (
        <div className={`${styles.card} ${className}`.trim()} data-variant={variant}>
            <div className={styles.row1}>
                <span className={`material-symbols-rounded ${styles.icon}`}>{icon}</span>
                <span className={styles.label}>{label}</span>
            </div>
            <div className={styles.row2}>{value}</div>
        </div>
    );
};
