import React from 'react';
import { useAtom } from 'jotai';
import { splitPaneSearchModeAtom } from '../atoms';
import styles from './SplitPaneToggle.module.css';

export const SplitPaneToggle: React.FC = () => {
    const [mode, setMode] = useAtom(splitPaneSearchModeAtom);

    return (
        <div className={styles.toggleContainer}>
            <button
                className={`${styles.toggleButton} ${mode === 'email' ? styles.active : ''}`}
                onClick={() => setMode('email')}
            >
                Search Email
            </button>
            <button
                className={`${styles.toggleButton} ${mode === 'case' ? styles.active : ''}`}
                onClick={() => setMode('case')}
            >
                Search Case
            </button>
        </div>
    );
};
