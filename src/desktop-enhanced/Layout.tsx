import React, { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import styles from './Layout.module.css';
import { desktopEnhancedSelectionAtom, chromeStyleAtom } from './atoms';
import { desktopFilterAtom } from '../desktop/atoms';
import { activePageAtom } from '../data/activePageAtom';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const selection = useAtomValue(desktopEnhancedSelectionAtom);
    const setFilter = useSetAtom(desktopFilterAtom);
    const activePage = useAtomValue(activePageAtom);
    const chromeStyle = useAtomValue(chromeStyleAtom);

    // Sync chrome style to root element
    useEffect(() => {
        const root = document.documentElement;
        if (chromeStyle === 'elevated') {
            root.setAttribute('data-chrome-style', 'elevated');
        } else {
            root.removeAttribute('data-chrome-style');
        }
    }, [chromeStyle]);

    // Sync selection to filter
    useEffect(() => {
        if (activePage !== 'checks') return; // Guard: skip filter sync on settings
        
        if (selection.type === 'root') {
            setFilter(prev => ({ ...prev, group: 'all', unit: 'all' }));
        } else if (selection.type === 'group') {
            setFilter(prev => ({ ...prev, group: selection.id, unit: 'all' }));
        } else if (selection.type === 'unit') {
            setFilter(prev => ({
                ...prev,
                group: selection.parentId || 'all',
                unit: selection.id
            }));
        }
    }, [selection, setFilter, activePage]);

    return (
        <div className={styles.layout}>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
};
