import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import styles from './Layout.module.css';
import { TopNav } from './components/TopNav';
import { SideBar } from '../desktop/components/SideBar/SideBar';
// import { ExtremeLeftNav } from './components/ExtremeLeftNav'; // Removed
import { desktopEnhancedPanelWidthAtom, desktopEnhancedSelectionAtom, chromeStyleAtom } from './atoms';
import { desktopFilterAtom } from '../desktop/atoms';
import { activePageAtom } from '../data/activePageAtom';
import { useLayoutRegistration } from '../data/useLayoutRegistration';
import { headerHeightAtom } from '../data/layoutAtoms';

interface LayoutProps {
    leftPanel?: React.ReactNode;
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ leftPanel, children }) => {
    const [width, setWidth] = useAtom(desktopEnhancedPanelWidthAtom);
    const selection = useAtomValue(desktopEnhancedSelectionAtom);
    const setFilter = useSetAtom(desktopFilterAtom);
    const activePage = useAtomValue(activePageAtom);
    const [isResizing, setIsResizing] = useState(false);
    const widthRef = useRef(width);
    const topNavRef = useLayoutRegistration(headerHeightAtom);
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

    const startResizing = useCallback((e: React.MouseEvent) => {
        setIsResizing(true);
        e.preventDefault();
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        setWidth(widthRef.current);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, [setWidth]);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            // Use CSS property for the offset from the strip
            const stripWidthStr = getComputedStyle(document.documentElement).getPropertyValue('--layout-surface-width-nav-rail').trim();
            const stripWidth = parseInt(stripWidthStr) || 192;
            const newWidth = e.clientX - stripWidth;
            if (newWidth > 260 && newWidth < 450) {
                widthRef.current = newWidth;
                document.documentElement.style.setProperty('--desktop-panel-width', `${newWidth}px`);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div className={styles.layout}>
            <TopNav ref={topNavRef as React.RefObject<HTMLDivElement>} />
            <div className={styles.body}>
                <SideBar />
                {leftPanel && (
                    <div
                        className={styles.leftPanelWrapper}
                        style={{ width: `var(--desktop-panel-width, ${width}px)` }}
                    >
                        {leftPanel}
                        <div
                            className={`${styles.resizer} ${isResizing ? styles.resizerActive : ''}`}
                            onMouseDown={startResizing}
                        >
                            <div className={styles.resizeIndicator} />
                        </div>
                    </div>
                )}
                <main className={styles.mainContent}>
                    {children}
                </main>
            </div>
        </div>
    );
};
