import React, { useMemo } from 'react';
import { Button } from '../../components/Button';
import { Select, SelectItem } from '../../components/Select';
import styles from './PortalAccessAdvancedSearch.module.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: 'Active', label: 'Portal access' },
    { value: 'Inactive', label: 'No Portal access' },
] as const;

const CASE_TYPE_OPTIONS = [
    { value: 'all', label: 'All case types' },
    { value: 'Civil', label: 'Civil' },
    { value: 'Criminal', label: 'Criminal' },
    { value: 'Juvenile', label: 'Juvenile' },
] as const;

const ACCESS_TYPE_OPTIONS = [
    { value: 'all', label: 'All access types' },
    { value: 'Direct access', label: 'Direct access' },
    { value: 'Delegated access', label: 'Delegated access' },
] as const;

export interface PortalAccessFilters {
    query: string;
    email: string;
    caseNumber: string;
    caseName: string;
    participant: string;
    author: string;
    status: string;
    caseType: string;
    accessType: string;
}

interface PortalAccessAdvancedSearchProps {
    value: PortalAccessFilters;
    onChange: <K extends keyof PortalAccessFilters>(key: K, nextValue: PortalAccessFilters[K]) => void;
    onSearch: () => void;
    onReset: () => void;
    onClose: () => void;
}

export const EMPTY_PORTAL_ACCESS_FILTERS: PortalAccessFilters = {
    query: '',
    email: '',
    caseNumber: '',
    caseName: '',
    participant: '',
    author: '',
    status: 'all',
    caseType: 'all',
    accessType: 'all',
};

export const PortalAccessAdvancedSearch: React.FC<PortalAccessAdvancedSearchProps> = ({
    value,
    onChange,
    onSearch,
    onReset,
    onClose,
}) => {
    const statusValueLabel = useMemo(
        () => STATUS_OPTIONS.find(option => option.value === value.status)?.label ?? 'All statuses',
        [value.status]
    );
    const caseTypeValueLabel = useMemo(
        () => CASE_TYPE_OPTIONS.find(option => option.value === value.caseType)?.label ?? 'All case types',
        [value.caseType]
    );
    const accessTypeValueLabel = useMemo(
        () => ACCESS_TYPE_OPTIONS.find(option => option.value === value.accessType)?.label ?? 'All access types',
        [value.accessType]
    );

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.titleGroup}>
                    <h3 className={styles.title}>Advanced search</h3>
                    <p className={styles.subtitle}>Refine portal records by case, participant, and access details.</p>
                </div>
                <Button
                    variant="tertiary"
                    size="s"
                    iconOnly
                    onClick={onClose}
                    aria-label="Close advanced search"
                >
                    <span className="material-symbols-rounded">close</span>
                </Button>
            </div>

            <div className={styles.grid}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Has the words</label>
                    <input
                        className={styles.input}
                        value={value.query}
                        onChange={(event) => onChange('query', event.target.value)}
                        placeholder="Email, case, participant, or audit text"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email address</label>
                    <input
                        className={styles.input}
                        value={value.email}
                        onChange={(event) => onChange('email', event.target.value)}
                        placeholder="Filter to a specific email address"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Case number</label>
                    <input
                        className={styles.input}
                        value={value.caseNumber}
                        onChange={(event) => onChange('caseNumber', event.target.value)}
                        placeholder="CIV-24-0000016"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Case name</label>
                    <input
                        className={styles.input}
                        value={value.caseName}
                        onChange={(event) => onChange('caseName', event.target.value)}
                        placeholder="Search by case title"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Participant</label>
                    <input
                        className={styles.input}
                        value={value.participant}
                        onChange={(event) => onChange('participant', event.target.value)}
                        placeholder="Participant name or role"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Granted or shared by</label>
                    <input
                        className={styles.input}
                        value={value.author}
                        onChange={(event) => onChange('author', event.target.value)}
                        placeholder="Author or shared-with value"
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Status</label>
                    <Select
                        value={value.status}
                        onValueChange={(nextValue) => onChange('status', nextValue)}
                        placeholder="All statuses"
                        triggerClassName={`${styles.selectTrigger} ${styles.fullWidth}`}
                        valueLabel={statusValueLabel}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Access type</label>
                    <Select
                        value={value.accessType}
                        onValueChange={(nextValue) => onChange('accessType', nextValue)}
                        placeholder="All access types"
                        triggerClassName={`${styles.selectTrigger} ${styles.fullWidth}`}
                        valueLabel={accessTypeValueLabel}
                    >
                        {ACCESS_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label}>Case type</label>
                    <Select
                        value={value.caseType}
                        onValueChange={(nextValue) => onChange('caseType', nextValue)}
                        placeholder="All case types"
                        triggerClassName={`${styles.selectTrigger} ${styles.fullWidth}`}
                        valueLabel={caseTypeValueLabel}
                    >
                        {CASE_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </Select>
                </div>
            </div>

            <div className={styles.footer}>
                <Button variant="primary" size="m" onClick={onSearch}>
                    Search
                </Button>
                <Button variant="secondary" size="m" onClick={onReset}>
                    Reset
                </Button>
            </div>
        </div>
    );
};
