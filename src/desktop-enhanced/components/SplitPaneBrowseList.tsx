import React, { useMemo, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { portalResultsAtom, splitPaneSearchModeAtom, splitPaneSelectedItemAtom } from '../atoms';
import { PortalAccessRecord } from '../types/portalTypes';
import styles from './SplitPaneBrowseList.module.css';

interface EmailBrowseItem {
    email: string;
    withAccess: number;
    withoutAccess: number;
}

interface CaseBrowseItem {
    caseNumber: string;
    caseName: string;
    withAccess: number;
    withoutAccess: number;
}

function groupByEmail(records: PortalAccessRecord[]): EmailBrowseItem[] {
    const map = new Map<string, { withAccess: number; withoutAccess: number }>();
    for (const r of records) {
        const key = r.email;
        if (!key) continue;
        const entry = map.get(key) || { withAccess: 0, withoutAccess: 0 };
        if (r.status === 'Active') {
            entry.withAccess++;
        } else {
            entry.withoutAccess++;
        }
        map.set(key, entry);
    }
    return Array.from(map.entries()).map(([email, counts]) => ({ email, ...counts }));
}

function groupByCase(records: PortalAccessRecord[]): CaseBrowseItem[] {
    const map = new Map<string, { caseName: string; withAccess: number; withoutAccess: number }>();
    for (const r of records) {
        const key = r.caseNumber;
        const entry = map.get(key) || { caseName: r.caseName, withAccess: 0, withoutAccess: 0 };
        if (r.status === 'Active') {
            entry.withAccess++;
        } else {
            entry.withoutAccess++;
        }
        map.set(key, entry);
    }
    return Array.from(map.entries()).map(([caseNumber, data]) => ({
        caseNumber,
        caseName: data.caseName,
        withAccess: data.withAccess,
        withoutAccess: data.withoutAccess,
    }));
}

export const SplitPaneBrowseList: React.FC = () => {
    const results = useAtomValue(portalResultsAtom);
    const mode = useAtomValue(splitPaneSearchModeAtom);
    const [selectedItem, setSelectedItem] = useAtom(splitPaneSelectedItemAtom);
    const [search, setSearch] = useState('');

    const emailItems = useMemo(() => groupByEmail(results), [results]);
    const caseItems = useMemo(() => groupByCase(results), [results]);

    const filteredEmailItems = useMemo(() => {
        if (!search) return emailItems;
        const q = search.toLowerCase();
        return emailItems.filter(item => item.email.toLowerCase().includes(q));
    }, [emailItems, search]);

    const filteredCaseItems = useMemo(() => {
        if (!search) return caseItems;
        const q = search.toLowerCase();
        return caseItems.filter(item =>
            item.caseNumber.toLowerCase().includes(q) ||
            item.caseName.toLowerCase().includes(q)
        );
    }, [caseItems, search]);

    return (
        <div className={styles.browseList}>
            <div className={styles.searchWrapper}>
                <span className={`material-symbols-rounded ${styles.searchIcon}`}>search</span>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder={mode === 'email' ? 'Filter by email...' : 'Filter by case...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button
                        className={styles.clearButton}
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {mode === 'email' ? (
                    filteredEmailItems.map((item) => (
                        <div
                            key={item.email}
                            className={`${styles.row} ${selectedItem === item.email ? styles.selected : ''}`}
                            onClick={() => setSelectedItem(item.email)}
                        >
                            <span className={styles.label}>{item.email}</span>
                            <div className={styles.badges}>
                                <div className={styles.badgeSlot} title="With access">
                                    {item.withAccess > 0 ? (
                                        <span className={`${styles.badge} ${styles.success}`}>{item.withAccess}</span>
                                    ) : (
                                        <span className={styles.badgePlaceholder} />
                                    )}
                                </div>
                                <div className={styles.badgeSlot} title="Without access">
                                    {item.withoutAccess > 0 ? (
                                        <span className={`${styles.badge} ${styles.warning}`}>{item.withoutAccess}</span>
                                    ) : (
                                        <span className={styles.badgePlaceholder} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredCaseItems.map((item) => (
                        <div
                            key={item.caseNumber}
                            className={`${styles.row} ${selectedItem === item.caseNumber ? styles.selected : ''}`}
                            onClick={() => setSelectedItem(item.caseNumber)}
                        >
                            <div className={styles.caseInfo}>
                                <span className={styles.label}>{item.caseNumber}</span>
                                <span className={styles.caseName}>{item.caseName}</span>
                            </div>
                            <div className={styles.badges}>
                                <div className={styles.badgeSlot} title="With access">
                                    {item.withAccess > 0 ? (
                                        <span className={`${styles.badge} ${styles.success}`}>{item.withAccess}</span>
                                    ) : (
                                        <span className={styles.badgePlaceholder} />
                                    )}
                                </div>
                                <div className={styles.badgeSlot} title="Without access">
                                    {item.withoutAccess > 0 ? (
                                        <span className={`${styles.badge} ${styles.warning}`}>{item.withoutAccess}</span>
                                    ) : (
                                        <span className={styles.badgePlaceholder} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {mode === 'email' && filteredEmailItems.length === 0 && (
                    <div className={styles.empty}>No emails match your search.</div>
                )}
                {mode === 'case' && filteredCaseItems.length === 0 && (
                    <div className={styles.empty}>No cases match your search.</div>
                )}
            </div>
        </div>
    );
};
