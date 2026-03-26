import { useEffect, useRef, useState, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from './Layout';
import { NavigationPanel } from './components/NavigationPanel';
import { Breadcrumbs } from './components/Breadcrumbs';
import {
    desktopFilterAtom,
    activeDetailRecordAtom,
    isDetailPanelOpenAtom,
    autoOpenDetailPanelAtom,
    selectedHistoryRowsAtom,
    selectedLiveRowsAtom,
    panelWidthAtom,
    desktopViewAtom,
    isNoResultsAtom,
    refreshButtonStyleAtom
} from '../desktop/atoms';
import { EnhancedLiveMonitorView as LiveMonitorView } from './components/EnhancedLiveMonitorView';
import { EnhancedHistoricalReviewView as HistoricalReviewView } from './components/EnhancedHistoricalReviewView';
import { PortalManagementView } from './components/PortalManagementView';
import { DesktopToolbar } from '../desktop/components/DesktopToolbar';
import { DetailPanel } from '../desktop/components/DetailPanel';
import { SupervisorNoteModal } from '../desktop/components/SupervisorNoteModal';
import { ToastContainer } from '../components/ToastContainer';
import { ToastMessage } from '../components/Toast';
import { toastsAtom } from '../data/toastAtoms';
import { activePageAtom } from '../data/activePageAtom';
import { SettingsPage } from '../features/settings/components/SettingsPage';
import { SettingsTabbedPage } from '../features/settings/components/SettingsTabbedPage';
import { SettingsNavigationPanel } from '../features/settings/components/SettingsNavigationPanel';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
// import { Popover } from '../components/Popover';
import { useAppFont } from '../hooks/useAppFont';
import styles from './DesktopEnhancedApp.module.css';

export default function DesktopEnhancedApp() {
    useAppFont(); // Sync font selection to document element
    const activePage = useAtomValue(activePageAtom);
    // FIX: Use the specific enhanced view atom shared with ModeToggle
    const view = useAtomValue(desktopViewAtom);
    const isNoResults = useAtomValue(isNoResultsAtom);

    const setFilter = useSetAtom(desktopFilterAtom);

    const activeRecord = useAtomValue(activeDetailRecordAtom);
    const [isPanelOpen, setIsPanelOpen] = useAtom(isDetailPanelOpenAtom);
    // const [isExportOpen, setIsExportOpen] = useState(false);
    const autoOpenPanel = useAtomValue(autoOpenDetailPanelAtom);
    const panelWidth = useAtomValue(panelWidthAtom);

    const toasts = useAtomValue(toastsAtom);
    const refreshButtonStyle = useAtomValue(refreshButtonStyleAtom);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(() => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 2000);
    }, [isRefreshing]);

    // Selection counts for panel empty states
    const [selectedLive, setSelectedLive] = useAtom(selectedLiveRowsAtom);
    const [selectedHistory, setSelectedHistory] = useAtom(selectedHistoryRowsAtom);
    const setActiveRecord = useSetAtom(activeDetailRecordAtom);
    const totalSelected = selectedLive.size + selectedHistory.size;

    // Track mount state to prevent resetting persisted filters on reload
    const isMountedRef = useRef(false);

    // Handle View Switching Logic
    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;
            return;
        }

        setActiveRecord(null);
        setSelectedLive(new Set());
        setSelectedHistory(new Set());

        // Apply default filters when explicitly switching views
        if (view === 'historical') {
            setFilter(prev => ({
                ...prev,
                historicalStatusFilter: ['missed-not-reviewed'],
                // Time range "Last 24h" (mock values)
                dateStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                dateEnd: new Date().toISOString().split('T')[0],
            }));
        } else {
            // Reset filters for Live
            setFilter(prev => ({
                ...prev,
                statusFilter: 'all',
                dateStart: null,
                dateEnd: null,
            }));
        }
    }, [view, setFilter, setActiveRecord, setSelectedLive, setSelectedHistory]);

    /**
     * ARCHITECTURAL INVARIANT: Side Panel Visibility
     * The panel is visible if:
     * 1. It is explicitly "Open" (Preview Mode) (isPanelOpen === true)
     * 2. Auto-open is ENABLED AND exactly one record is selected (Transient Mode)
     */
    const showPanel = isPanelOpen || (autoOpenPanel && totalSelected === 1);
    const [isResizing, setIsResizing] = useState(false);

    // Grid styling removed in favor of Flexbox optimization
    // const mainContainerStyle = ...

    return (
        <Layout
            leftPanel={
                activePage === 'checks' ? <NavigationPanel /> :
                    activePage === 'settings' ? <SettingsNavigationPanel /> :
                        undefined
            }
        >
            <ToastPrimitive.Provider swipeDirection="right" swipeThreshold={80}>
                {activePage === 'settings' ? (
                    <SettingsPage />
                ) : activePage === 'settings-tabs' ? (
                    <SettingsTabbedPage />
                ) : (
                    <div
                        data-platform="desktop"
                        data-view-mode={view}
                        className={styles.mainContainer}
                        data-panel-open={showPanel}
                    >
                        <div className={styles.contentWrapper}>
                            <div className={styles.navContainer}>
                                {!activePage.startsWith('portal-') && (
                                    <div className={styles.navRow1}>
                                        <Breadcrumbs />
                                    </div>
                                )}
                                <div className={styles.navRow2}>
                                    <h2 className={styles.pageTitle}>
                                        {isNoResults ? 'No search results' : 
                                         activePage.startsWith('portal-') ? 'Portal Management Audit' :
                                         `Safeguard checks – ${view === 'live' ? 'Live view' : 'Historical view'}`}
                                    </h2>

                                    {!activePage.startsWith('portal-') && (
                                        <div className={styles.row2Actions}>
                                            <Tooltip content="Refresh data">
                                                {refreshButtonStyle === 'icon' ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="s"
                                                        iconOnly
                                                        onClick={handleRefresh}
                                                        disabled={isRefreshing}
                                                    >
                                                        <span
                                                            className={`material-symbols-rounded ${styles.refreshIcon}`}
                                                            data-refreshing={isRefreshing}
                                                        >
                                                            {isRefreshing ? 'progress_activity' : 'refresh'}
                                                        </span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="s"
                                                        onClick={handleRefresh}
                                                        disabled={isRefreshing}
                                                        className={styles.refreshButton}
                                                    >
                                                        {isRefreshing ? (
                                                            <span
                                                                className={`material-symbols-rounded ${styles.refreshSpinner}`}
                                                            >
                                                                progress_activity
                                                            </span>
                                                        ) : (
                                                            'Refresh'
                                                        )}
                                                    </Button>
                                                )}
                                            </Tooltip>

                                            <Tooltip content="Export data">
                                                <Button
                                                    variant="secondary"
                                                    size="s"
                                                    onClick={() => {}}
                                                >
                                                    Export
                                                </Button>
                                            </Tooltip>

                                            <Tooltip content={showPanel ? "Close side panel" : "Open side panel"}>
                                                <Button
                                                    variant="secondary"
                                                    size="s"
                                                    iconOnly
                                                    active={isPanelOpen}
                                                    onClick={() => {
                                                        if (showPanel) {
                                                            // Close and Clear Selection
                                                            setIsPanelOpen(false);
                                                            setSelectedLive(new Set());
                                                            setSelectedHistory(new Set());
                                                        } else {
                                                            // Open/Pin
                                                            setIsPanelOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <span className="material-symbols-rounded">
                                                        {showPanel ? 'right_panel_close' : 'right_panel_open'}
                                                    </span>
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!activePage.startsWith('portal-') && (
                                <div className={styles.toolbarWrapper}>
                                    <DesktopToolbar isEnhanced={true} />
                                </div>
                            )}

                            <div className={styles.viewWrapper}>
                                {activePage.startsWith('portal-') ? (
                                    <PortalManagementView />
                                ) : view === 'live' ? (
                                    <LiveMonitorView />
                                ) : (
                                    <HistoricalReviewView />
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showPanel && (
                                <motion.div
                                    className={styles.detailPanelWrapper}
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{
                                        width: isResizing ? 'var(--panel-width)' : panelWidth,
                                        opacity: 1
                                    }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{
                                        type: 'tween',
                                        ease: [0.16, 1, 0.3, 1],
                                        duration: isResizing ? 0 : 0.3
                                    }}
                                    style={{ overflow: 'hidden' }}
                                    data-resizing={isResizing}
                                >
                                    <DetailPanel
                                        record={activeRecord}
                                        selectedCount={totalSelected}
                                        onResizeStart={() => setIsResizing(true)}
                                        onResizeEnd={() => setIsResizing(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <SupervisorNoteModal />

                        {/* Toast System */}
                        <AnimatePresence>
                            {toasts.map((toast) => (
                                <ToastMessage key={toast.id} {...toast} />
                            ))}
                        </AnimatePresence>
                        <ToastContainer platform="desktop" />
                    </div>
                )}
            </ToastPrimitive.Provider>
        </Layout>
    );
}
