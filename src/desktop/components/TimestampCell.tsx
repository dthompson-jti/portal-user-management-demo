import { useAtomValue } from 'jotai';
import { timestampPrecisionModeAtom, preciseTooltipAtom } from '../atoms';
import { Tooltip } from '../../components/Tooltip';
import styles from './DataTable.module.css';

interface TimestampCellProps {
    isoString: string | null | undefined;
}

export const TimestampCell = ({ isoString }: TimestampCellProps) => {
    const precision = useAtomValue(timestampPrecisionModeAtom);
    const isPreciseTooltip = useAtomValue(preciseTooltipAtom);

    if (!isoString) {
        return <span className={styles.secondaryText}>—</span>;
    }

    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return <span className={styles.primaryText}>{isoString}</span>;
    }

    const dateStr = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
    });

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: precision === 'seconds' ? '2-digit' : undefined,
        hour12: true,
    });

    const tooltipContent = isPreciseTooltip
        ? date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        })
        : undefined;

    return (
        <Tooltip content={tooltipContent}>
            <div className={styles.singleRowCell}>
                <span className={styles.primaryText}>{dateStr}</span>
                <span className={styles.secondaryText}>{timeStr}</span>
            </div>
        </Tooltip>
    );
};
