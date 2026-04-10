// src/desktop/components/DesktopHeader.tsx

import { useAtomValue } from 'jotai';
import { desktopViewAtom } from '../atoms';
import { DesktopTabGroup } from './DesktopTabGroup';
import { Button } from '../../components/Button';
import styles from './DesktopHeader.module.css';

interface DesktopHeaderProps {
    onTogglePanel: () => void;
    isPanelOpen: boolean;
}

export const DesktopHeader = ({ onTogglePanel, isPanelOpen }: DesktopHeaderProps) => {
    const view = useAtomValue(desktopViewAtom);

    return (
        <header className={styles.header}>
            {/* Left: Title */}
            <div className={styles.leftSection}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Portal Access Management</h1>
                </div>
            </div>

            {/* Center: Tabs */}
            <div className={styles.centerSection}>
                <DesktopTabGroup />
            </div>

            {/* Right: Countdown Widget (Live) or Actions (Historical) */}
            <div className={styles.rightSection}>
                {view === 'historical' && (
                    <>
                        {/* 
                        <button
                            className="btn"
                            data-variant="secondary"
                            data-size="s"
                            aria-label="Export data"
                        >
                            Export
                        </button>
                        */}

                        <Button
                            variant="secondary"
                            size="s"
                            iconOnly
                            active={isPanelOpen}
                            onClick={onTogglePanel}
                            aria-label="Toggle side panel"
                            aria-pressed={isPanelOpen}
                        >
                            <span className="material-symbols-rounded">
                                {isPanelOpen ? 'right_panel_close' : 'right_panel_open'}
                            </span>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
};
