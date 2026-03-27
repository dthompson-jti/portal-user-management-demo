import { useMemo, useState, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    desktopViewAtom,
    desktopFilterAtom,
    modifiedFiltersAtom,
    isFilterCustomizedAtom,
    updateFilterAtom,
    clearFilterForKeyAtom,
    resetFiltersAtom,
    isAdvancedSearchOpenAtom
} from '../atoms';
import { LiveStatusFilter, HistoricalStatusFilter, TimeRangePreset } from '../types';
import { InstantSearch } from '../../components/InstantSearch';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { FilterSelect } from './FilterSelect';
import { MultiFilterSelect } from './MultiFilterSelect';
import { AdvancedSearch } from './AdvancedSearch';
import styles from './DesktopToolbar.module.css';

const formatDateRange = (start: string | null, end: string | null) => {
    if (!start || !end) return '';
    const s = new Date(start);
    const e = new Date(end);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const sStr = s.toLocaleDateString('en-US', options);
    const eStr = e.toLocaleDateString('en-US', options);

    return `${sStr} – ${eStr}`;
};

const LIVE_STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'due', label: 'Due' },
    { value: 'overdue', label: 'Missed' },
    { value: 'upcoming', label: 'Upcoming' },
];

const HISTORICAL_STATUS_OPTIONS = [
    { value: 'missed-not-reviewed', label: 'Missed – not reviewed' },
    { value: 'missed-reviewed', label: 'Missed – reviewed' },
    { value: 'completed', label: 'Completed – on time' },
    { value: 'completed-late', label: 'Completed – late' },
];

const TIME_RANGE_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'last-8h', label: 'Last 8 hours' },
    { value: 'last-12h', label: 'Last 12 hours' },
    { value: 'last-24h', label: 'Last 24 hours' },
    { value: 'last-72h', label: 'Last 72 hours' },
    { value: 'custom', label: 'Custom range...' },
];

const AREA_OPTIONS = [
    { value: 'all', label: 'All facility areas' },
    { value: 'area-a', label: 'Facility area Alpha' },
    { value: 'area-b', label: 'Facility area Bravo' },
    { value: 'area-c', label: 'Facility area Charlie' },
    { value: 'area-d', label: 'Facility area Delta' },
];

interface DesktopToolbarProps {
    isEnhanced?: boolean;
}

export const DesktopToolbar = ({ isEnhanced = false }: DesktopToolbarProps) => {
    const view = useAtomValue(desktopViewAtom);
    const filter = useAtomValue(desktopFilterAtom);
    const modifiedKeys = useAtomValue(modifiedFiltersAtom);
    const isCustomized = useAtomValue(isFilterCustomizedAtom);
    const updateFilter = useSetAtom(updateFilterAtom);
    const clearFilter = useSetAtom(clearFilterForKeyAtom);
    const resetFilters = useSetAtom(resetFiltersAtom);
    const [isAdvancedOpen, setIsAdvancedOpen] = useAtom(isAdvancedSearchOpenAtom);

    const [isCustomRangeOpen, setIsCustomRangeOpen] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const handleSearchChange = useCallback((val: string) => {
        updateFilter({ search: val });
    }, [updateFilter]);

    const handleLiveStatusFilterChange = (val: string) => {
        updateFilter({ statusFilter: val as LiveStatusFilter });
    };

    const handleHistoricalStatusFilterChange = (vals: string[]) => {
        updateFilter({ historicalStatusFilter: vals as HistoricalStatusFilter[] });
    };

    const handleTimeRangeChange = (val: string) => {
        if (val === 'custom') {
            setCustomStart(filter.dateStart || '');
            setCustomEnd(filter.dateEnd || '');
            setIsCustomRangeOpen(true);
            return;
        }

        const now = new Date();
        const nowStr = now.toISOString().split('T')[0];
        let startStr: string;

        switch (val) {
            case 'today':
                startStr = nowStr;
                break;
            case 'last-8h': {
                const start = new Date(now.getTime() - 8 * 60 * 60 * 1000);
                startStr = start.toISOString().split('T')[0];
                break;
            }
            case 'last-12h': {
                const start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
                startStr = start.toISOString().split('T')[0];
                break;
            }
            case 'last-24h': {
                const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                startStr = start.toISOString().split('T')[0];
                break;
            }
            case 'last-72h': {
                const start = new Date(now.getTime() - 72 * 60 * 60 * 1000);
                startStr = start.toISOString().split('T')[0];
                break;
            }
            default:
                startStr = nowStr;
        }

        updateFilter({
            timeRangePreset: val as TimeRangePreset,
            dateStart: startStr,
            dateEnd: nowStr,
        });
    };

    const applyCustomRange = () => {
        if (customStart && customEnd) {
            updateFilter({
                timeRangePreset: 'custom',
                dateStart: customStart,
                dateEnd: customEnd,
            });
        }
        setIsCustomRangeOpen(false);
    };

    const handleAreaFilterChange = (val: string) => {
        updateFilter({ facility: val });
    };

    const handleReset = () => {
        resetFilters();
    };

    const dateRangeLabel = useMemo(() => {
        if (filter.timeRangePreset === 'custom') {
            return formatDateRange(filter.dateStart, filter.dateEnd);
        }
        return undefined;
    }, [filter.timeRangePreset, filter.dateStart, filter.dateEnd]);

    if (view === 'historical' && !isEnhanced && isAdvancedOpen) {
        return <AdvancedSearch onClose={() => setIsAdvancedOpen(false)} />;
    }

    return (
        <div className={styles.toolbar}>
            <div className={styles.leftSection}>
                <InstantSearch
                    value={filter.search}
                    onChange={handleSearchChange}
                    placeholder="Find records"
                    className={styles.searchWidth}
                />

                {view === 'historical' && !isEnhanced && (
                    <button
                        className="btn"
                        data-variant={isAdvancedOpen ? "primary" : "secondary"}
                        data-size="m"
                        data-icon-only="true"
                        aria-label="Advanced search"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    >
                        <span className="material-symbols-rounded">tune</span>
                    </button>
                )}
            </div>

            <div className={styles.filterChips}>
                {isCustomized && (
                    <Button
                        variant="tertiary"
                        size="m"
                        onClick={handleReset}
                    >
                        Reset filters
                    </Button>
                )}

                <div className={styles.statusSelectWrapper}>
                    {view === 'live' ? (
                        <FilterSelect
                            value={filter.statusFilter}
                            isCustomized={modifiedKeys.includes('statusFilter')}
                            onValueChange={handleLiveStatusFilterChange}
                            onClear={() => clearFilter('statusFilter')}
                            placeholder="Status"
                            options={LIVE_STATUS_OPTIONS}
                        />
                    ) : (
                        <MultiFilterSelect
                            value={filter.historicalStatusFilter}
                            isCustomized={modifiedKeys.includes('historicalStatusFilter')}
                            onValueChange={handleHistoricalStatusFilterChange}
                            onClear={() => clearFilter('historicalStatusFilter')}
                            placeholder="All States"
                            options={HISTORICAL_STATUS_OPTIONS}
                        />
                    )}
                </div>

                {view === 'historical' && (
                    <div className={styles.timeRangeSelectWrapper}>
                        <FilterSelect
                            value={filter.timeRangePreset}
                            isCustomized={modifiedKeys.includes('timeRangePreset')}
                            onValueChange={handleTimeRangeChange}
                            onClear={() => clearFilter('timeRangePreset')}
                            placeholder="Time range"
                            options={TIME_RANGE_OPTIONS}
                            displayLabel={dateRangeLabel}
                        />

                        <Modal
                            isOpen={isCustomRangeOpen}
                            onClose={() => setIsCustomRangeOpen(false)}
                            title="Custom date range"
                            width="375px"
                        >
                            <Modal.Header>
                                <span className={styles.modalTitle}>Custom date range</span>
                                <Button
                                    iconOnly
                                    size="s"
                                    variant="tertiary"
                                    onClick={() => setIsCustomRangeOpen(false)}
                                    aria-label="Close"
                                >
                                    <span className="material-symbols-rounded">close</span>
                                </Button>
                            </Modal.Header>

                            <Modal.Content>
                                <div className={styles.dateInputsRow}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            Start date <em>*</em>
                                        </label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={customStart}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                        />
                                    </div>
                                    <span className={styles.dashSpacer}>–</span>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>
                                            End date <em>*</em>
                                        </label>
                                        <input
                                            type="date"
                                            className={styles.dateInput}
                                            value={customEnd}
                                            onChange={(e) => setCustomEnd(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Modal.Content>

                            <Modal.Footer>
                                <div className={styles.modalFooterActions}>
                                    <Button
                                        size="m"
                                        variant="primary"
                                        disabled={!customStart || !customEnd}
                                        onClick={applyCustomRange}
                                    >
                                        Apply
                                    </Button>
                                    <Button
                                        size="m"
                                        variant="secondary"
                                        onClick={() => setIsCustomRangeOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )}

                {!isEnhanced && (
                    <div className={styles.facilitySelectWrapper}>
                        <FilterSelect
                            value={filter.facility}
                            isCustomized={modifiedKeys.includes('facility')}
                            onValueChange={handleAreaFilterChange}
                            onClear={() => clearFilter('facility')}
                            placeholder="Facility area"
                            options={AREA_OPTIONS}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
