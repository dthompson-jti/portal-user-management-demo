import { useAtom } from 'jotai';
import * as Popover from '@radix-ui/react-popover';
import { skeletonForcedAtom } from '../../desktop/atoms';
import { Switch } from '../../components/Switch';
import styles from './TopNavMenu.module.css';

export const TopNavMenu = () => {
    const [skeletonForced, setSkeletonForced] = useAtom(skeletonForcedAtom);

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={styles.hamburgerButton} aria-label="Main menu">
                    <span className="material-symbols-rounded">menu</span>
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content className={styles.popoverContent} align="start" sideOffset={8}>
                    <div className={styles.sectionHeader}>Prototype settings</div>
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
