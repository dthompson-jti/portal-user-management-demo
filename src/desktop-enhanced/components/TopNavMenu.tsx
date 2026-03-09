import * as Popover from '@radix-ui/react-popover';
import { useAtom } from 'jotai';
import { desktopEnhancedTreeLayoutAtom } from '../atoms';
import {
    residentDisplayModeAtom,
    residentBadgeTextAtom,
    autoOpenDetailPanelAtom,
    residentBadgeColorModeAtom,
    reasonSelectionModeAtom,
    appFontAtom,
    timestampPrecisionModeAtom,
    preciseTooltipAtom
} from '../../desktop/atoms';

import { Switch } from '../../components/Switch';
import styles from './TopNavMenu.module.css';

export const TopNavMenu = () => {
    const [treeLayout, setTreeLayout] = useAtom(desktopEnhancedTreeLayoutAtom);
    const [residentDisplayMode, setResidentDisplayMode] = useAtom(residentDisplayModeAtom);
    const [residentBadgeText, setResidentBadgeText] = useAtom(residentBadgeTextAtom);
    const [badgeColorMode, setBadgeColorMode] = useAtom(residentBadgeColorModeAtom);
    const [autoOpenPanel, setAutoOpenPanel] = useAtom(autoOpenDetailPanelAtom);
    const [reasonSelectionMode, setReasonSelectionMode] = useAtom(reasonSelectionModeAtom);
    const [appFont, setAppFont] = useAtom(appFontAtom);
    const [timestampPrecision, setTimestampPrecision] = useAtom(timestampPrecisionModeAtom);
    const [preciseTooltip, setPreciseTooltip] = useAtom(preciseTooltipAtom);

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={styles.hamburgerButton} aria-label="Main menu">
                    <span className="material-symbols-rounded">menu</span>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} align="start" sideOffset={8}>

                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span>Show indentation lines</span>
                        </div>
                        <Switch
                            checked={treeLayout === 'indented'}
                            onCheckedChange={(checked) => setTreeLayout(checked ? 'indented' : 'full-width')}
                            id="indent-toggle"
                        />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.sectionHeader}>Resident Display</div>

                    <div className={styles.displayOptionsGrid}>
                        <button
                            className={styles.optionButton}
                            data-active={residentDisplayMode === 'left-badge'}
                            onClick={() => setResidentDisplayMode('left-badge')}
                        >
                            <span>Left</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={residentDisplayMode === 'chip'}
                            onClick={() => setResidentDisplayMode('chip')}
                        >
                            <span>Chip</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={residentDisplayMode === 'right-badge'}
                            onClick={() => setResidentDisplayMode('right-badge')}
                        >
                            <span>Right</span>
                        </button>
                    </div>

                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span>Show full warning text</span>
                        </div>
                        <Switch
                            checked={residentBadgeText === 'full'}
                            onCheckedChange={(checked) => setResidentBadgeText(checked ? 'full' : 'short')}
                            id="badge-text-toggle"
                        />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.sectionHeader}>Timestamp Precision</div>

                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span>Show seconds in table</span>
                        </div>
                        <Switch
                            checked={timestampPrecision === 'seconds'}
                            onCheckedChange={(checked) => setTimestampPrecision(checked ? 'seconds' : 'minutes')}
                            id="seconds-toggle"
                        />
                    </div>

                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span>Precise tooltip timestamps</span>
                        </div>
                        <Switch
                            checked={preciseTooltip}
                            onCheckedChange={setPreciseTooltip}
                            id="precise-tooltip-toggle"
                        />
                    </div>


                    <div className={styles.divider} />

                    <div className={styles.sectionHeader}>Badge Color Mode</div>
                    <div className={styles.displayOptionsGrid}>
                        <button
                            className={styles.optionButton}
                            data-active={badgeColorMode === 'neutral-strong'}
                            onClick={() => setBadgeColorMode('neutral-strong')}
                            title="Neutral Strong"
                        >
                            <span>B</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={badgeColorMode === 'warning'}
                            onClick={() => setBadgeColorMode('warning')}
                            title="Warning"
                        >
                            <span>C</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={badgeColorMode === 'info'}
                            onClick={() => setBadgeColorMode('info')}
                            title="Info"
                        >
                            <span>D</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={badgeColorMode === 'solid'}
                            onClick={() => setBadgeColorMode('solid')}
                            title="Solid"
                        >
                            <span>E</span>
                        </button>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.menuRow}>
                        <div className={styles.menuRowText}>
                            <span className={styles.label}>Auto-open side panel</span>
                        </div>
                        <Switch
                            checked={autoOpenPanel}
                            onCheckedChange={setAutoOpenPanel}
                            id="auto-open-toggle"
                        />
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.sectionHeader}>Typography</div>
                    <div className={styles.displayOptionsGrid}>
                        <button
                            className={styles.optionButton}
                            data-active={appFont === 'inter'}
                            onClick={() => setAppFont('inter')}
                            title="Inter (Default)"
                        >
                            <span>Inter</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={appFont === 'hyperlegible'}
                            onClick={() => setAppFont('hyperlegible')}
                            title="Hyperlegible Sans"
                        >
                            <span>Hyperlegible</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={appFont === 'atkinson'}
                            onClick={() => setAppFont('atkinson')}
                            title="Atkinson"
                        >
                            <span>Atkinson</span>
                        </button>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.sectionHeader}>Reason Selection Mode</div>
                    <div className={styles.displayOptionsGrid}>
                        <button
                            className={styles.optionButton}
                            data-active={reasonSelectionMode === 'ghost'}
                            onClick={() => setReasonSelectionMode('ghost')}
                        >
                            <span>Ghost</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={reasonSelectionMode === 'none'}
                            onClick={() => setReasonSelectionMode('none')}
                        >
                            <span>None</span>
                        </button>
                        <button
                            className={styles.optionButton}
                            data-active={reasonSelectionMode === 'inline'}
                            onClick={() => setReasonSelectionMode('inline')}
                        >
                            <span>Inline</span>
                        </button>
                    </div>

                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};


