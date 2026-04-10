import { useAtom } from 'jotai';
import * as Popover from '@radix-ui/react-popover';
import {
    portalDensityModeAtom,
    portalCaseBadgeModeAtom,
    portalLedgerFooterVisibleAtom,
    portalLedgerHeaderVisibleAtom,
    portalLedgerSummaryBadgesVisibleAtom,
    terminologyAtom,
    STATUS_LABEL_OPTIONS,
    COLUMN_HEADER_OPTIONS,
} from '../atoms';
import { skeletonForcedAtom } from '../../desktop/atoms';
import { activePageAtom } from '../../data/activePageAtom';
import { Switch } from '../../components/Switch';
import styles from './TopNavMenu.module.css';

export const TopNavMenu = () => {
    const [activePage] = useAtom(activePageAtom);
    const [portalDensityMode, setPortalDensityMode] = useAtom(portalDensityModeAtom);
    const [portalCaseBadgeMode, setPortalCaseBadgeMode] = useAtom(portalCaseBadgeModeAtom);
    const [portalLedgerHeaderVisible, setPortalLedgerHeaderVisible] = useAtom(portalLedgerHeaderVisibleAtom);
    const [portalLedgerFooterVisible, setPortalLedgerFooterVisible] = useAtom(portalLedgerFooterVisibleAtom);
    const [portalLedgerSummaryBadgesVisible, setPortalLedgerSummaryBadgesVisible] = useAtom(portalLedgerSummaryBadgesVisibleAtom);
    const [skeletonForced, setSkeletonForced] = useAtom(skeletonForcedAtom);
    const [terminology, setTerminology] = useAtom(terminologyAtom);

    const isA3CaseView = activePage === 'portal-case-example';
    const isB3Ledger = activePage === 'portal-access-ledger';

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={styles.hamburgerButton} aria-label="Main menu">
                    <span className="material-symbols-rounded">menu</span>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} align="start" sideOffset={8}>
                    {isA3CaseView && (
                        <>
                            <div className={styles.sectionHeader}>A3 case view</div>
                            <div className={styles.displayOptionsGrid}>
                                <button
                                    className={styles.optionButton}
                                    data-active={portalCaseBadgeMode === 'off'}
                                    onClick={() => setPortalCaseBadgeMode('off')}
                                    type="button"
                                >
                                    <span>Badges off</span>
                                </button>
                                <button
                                    className={styles.optionButton}
                                    data-active={portalCaseBadgeMode === 'summary'}
                                    onClick={() => setPortalCaseBadgeMode('summary')}
                                    type="button"
                                >
                                    <span>2 badges</span>
                                </button>
                                <button
                                    className={styles.optionButton}
                                    data-active={portalCaseBadgeMode === 'detailed'}
                                    onClick={() => setPortalCaseBadgeMode('detailed')}
                                    type="button"
                                >
                                    <span>3 badges</span>
                                </button>
                            </div>
                            <div className={styles.divider} />
                        </>
                    )}

                    {isB3Ledger && (
                        <>
                            <div className={styles.sectionHeader}>B3 access ledger</div>
                            <div className={styles.menuRow}>
                                <div className={styles.menuRowText}>
                                    <span>Search result header</span>
                                </div>
                                <Switch
                                    checked={portalLedgerHeaderVisible}
                                    onCheckedChange={setPortalLedgerHeaderVisible}
                                    id="portal-ledger-header-toggle"
                                />
                            </div>
                            <div className={styles.menuRow}>
                                <div className={styles.menuRowText}>
                                    <span>Search result footer</span>
                                </div>
                                <Switch
                                    checked={portalLedgerFooterVisible}
                                    onCheckedChange={setPortalLedgerFooterVisible}
                                    id="portal-ledger-footer-toggle"
                                />
                            </div>
                            <div className={styles.menuRow}>
                                <div className={styles.menuRowText}>
                                    <span>Summary badges</span>
                                </div>
                                <Switch
                                    checked={portalLedgerSummaryBadgesVisible}
                                    onCheckedChange={setPortalLedgerSummaryBadgesVisible}
                                    id="portal-ledger-badges-toggle"
                                />
                            </div>
                            <div className={styles.divider} />
                        </>
                    )}

                    {/* ── Density ── */}
                    <div className={styles.sectionHeader}>Prototype settings</div>
                    <div className={styles.displayOptionsGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <button
                            className={styles.optionButton}
                            data-active={portalDensityMode === 'compact'}
                            onClick={() => setPortalDensityMode('compact')}
                            type="button"
                        >
                            <span>Compact mode</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={portalDensityMode === 'quick-actions'}
                            onClick={() => setPortalDensityMode('quick-actions')}
                            type="button"
                        >
                            <span>Quick actions</span>
                        </button>
                    </div>

                    <div className={styles.divider} />

                    {/* ── Status column header label ── */}
                    <div className={styles.sectionHeader}>Status column header</div>
                    <div className={styles.displayOptionsGrid} style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        {COLUMN_HEADER_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={styles.optionButton}
                                data-active={terminology.columnHeader === opt.value}
                                onClick={() => setTerminology(prev => ({ ...prev, columnHeader: opt.value }))}
                                type="button"
                            >
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.divider} />

                    {/* ── Status value labels ── */}
                    <div className={styles.sectionHeader}>Status labels</div>
                    <div className={styles.terminologyList}>
                        {STATUS_LABEL_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                className={styles.terminologyOption}
                                data-active={terminology.statusLabels === opt.value}
                                onClick={() => setTerminology(prev => ({ ...prev, statusLabels: opt.value }))}
                                type="button"
                            >
                                <span className={styles.terminologyActive}>{opt.activeLabel}</span>
                                <span className={styles.terminologySep}>/</span>
                                <span className={styles.terminologyInactive}>{opt.inactiveLabel}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.divider} />

                    {/* ── Simulate loading ── */}
                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span>Simulate slow loading mode</span>
                        </div>
                        <Switch
                            checked={skeletonForced}
                            onCheckedChange={setSkeletonForced}
                            id="skeleton-forced-toggle"
                        />
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
