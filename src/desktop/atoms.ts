// src/desktop/atoms.ts

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { STORAGE_PREFIX } from '../config';
import { DesktopView, DesktopFilter, HistoricalCheck, LiveCheckRow, HistoricalStatusFilter } from './types';
import { Resident } from '../types';
import { enhancedMockData } from '../desktop-enhanced/data/mockData';
// We'll need access to live data for the polymorphic resolver. 
// Ideally this should be exported from real stores, but for now we might need to rely on the view pushing data or a shared store.
// To keep it simple and clean: The View will push the *full object* to the panel atom when clicked.
// This avoids complex lookups in mock data.

/** Current desktop view: 'live' or 'historical' */
export const desktopViewAtom = atomWithStorage<DesktopView>(`${STORAGE_PREFIX}view`, 'historical');

/** Application font selection: 'inter', 'atkinson', 'hyperlegible' */
export type AppFont = 'inter' | 'atkinson' | 'hyperlegible';
export const appFontAtom = atomWithStorage<AppFont>(`${STORAGE_PREFIX}font`, 'inter');


/** Global state for advanced search panel visibility */
export const isAdvancedSearchOpenAtom = atom(false);

/** Toggle for showing residents in badges (chips) */
export const showResidentBadgesAtom = atomWithStorage<boolean>(`${STORAGE_PREFIX}show_resident_badges`, false);

/** Color mode for resident badges */
export type BadgeColorMode = 'warning' | 'info' | 'solid' | 'neutral-strong';
export const residentBadgeColorModeAtom = atomWithStorage<BadgeColorMode>(`${STORAGE_PREFIX}badge_color_mode`, 'neutral-strong');




/** Factory default filters (Immutable) */
export const FACTORY_FILTER_DEFAULTS: DesktopFilter = {
    facility: 'all',
    group: 'all',
    unit: 'all',
    search: '',
    showMissedOnly: false,
    statusFilter: 'all',
    historicalStatusFilter: ['missed-not-reviewed'],
    timeRangePreset: 'last-24h',
    dateStart: null,
    dateEnd: null,
    officer: '',
    startDate: null,
    endDate: null,
    enhancedObservation: 'any',
    commentFilter: 'any',
    commentReason: 'any',
    resident: '',
    reviewer: '',
};



/** Desktop filter state (Session - Persisted) */
const desktopFilterAtomRaw = atomWithStorage<DesktopFilter>(
    `${STORAGE_PREFIX}filter_session`,
    FACTORY_FILTER_DEFAULTS
);

/** 
 * Wrapper atom to handle migration of legacy storage data (string -> array)
 * This prevents app crashes when users with old data load the new version.
 */
export const desktopFilterAtom = atom<DesktopFilter, [update: DesktopFilter | ((prev: DesktopFilter) => DesktopFilter)], void>(
    (get) => {
        const value = get(desktopFilterAtomRaw);
        // Runtime check for legacy string value
        if (typeof value.historicalStatusFilter === 'string') {
            // Migration logic: convert legacy string to array
            const legacyValue = value.historicalStatusFilter as unknown as string;
            let newValue: HistoricalStatusFilter[] = [];

            if (legacyValue === 'all') newValue = []; // Empty array = All
            else if (legacyValue === 'missed-all') newValue = ['missed-not-reviewed', 'missed-reviewed'];
            else newValue = [legacyValue as HistoricalStatusFilter];

            return { ...value, historicalStatusFilter: newValue };
        }
        return value;
    },
    (get, set, update) => {
        const current = get(desktopFilterAtomRaw);
        const next = typeof update === 'function' ? update(current) : update;
        set(desktopFilterAtomRaw, next);
    }
);

/** Keys of filters that have been explicitly modified by the user */
export const modifiedFiltersAtom = atomWithStorage<string[]>(
    `${STORAGE_PREFIX}modified_filters`,
    []
);

/** 
 * Derived: returns true if current filters differ from factory defaults 
 * OR if the filter has been explicitly modified (stickiness)
 */
export const isFilterCustomizedAtom = atom((get) => {
    const current = get(desktopFilterAtom);
    const saved = FACTORY_FILTER_DEFAULTS;
    const modified = get(modifiedFiltersAtom);

    // If any filter is in the modified set, the global "Reset" should be visible
    if (modified.length > 0) return true;

    // Fallback deep equality check for the filter object (initial load/legacy)
    return (
        current.facility !== saved.facility ||
        current.group !== saved.group ||
        current.unit !== saved.unit ||
        current.search !== saved.search ||
        current.showMissedOnly !== saved.showMissedOnly ||
        current.statusFilter !== saved.statusFilter ||
        (current.historicalStatusFilter.length !== saved.historicalStatusFilter.length ||
            !current.historicalStatusFilter.every((v: HistoricalStatusFilter) => saved.historicalStatusFilter.includes(v))) ||
        current.timeRangePreset !== saved.timeRangePreset ||
        (current.timeRangePreset === 'custom' && (current.dateStart !== saved.dateStart || current.dateEnd !== saved.dateEnd)) ||
        current.officer !== saved.officer ||
        current.startDate !== saved.startDate ||
        current.endDate !== saved.endDate ||
        current.enhancedObservation !== saved.enhancedObservation ||
        current.commentFilter !== saved.commentFilter ||
        current.commentReason !== saved.commentReason ||
        current.resident !== saved.resident ||
        current.reviewer !== saved.reviewer
    );
});

export const updateFilterAtom = atom(null, (get, set, update: Partial<DesktopFilter>) => {
    const current = get(desktopFilterAtom);
    const modified = new Set(get(modifiedFiltersAtom));

    // Mark keys as modified
    Object.keys(update).forEach(key => modified.add(key));

    set(desktopFilterAtom, { ...current, ...update });
    set(modifiedFiltersAtom, Array.from(modified));
});

/** Write-only: Clear a specific filter's modification state and revert to default */
export const clearFilterForKeyAtom = atom(null, (get, set, key: keyof DesktopFilter) => {
    const current = get(desktopFilterAtom);
    const saved = FACTORY_FILTER_DEFAULTS;
    const modified = new Set(get(modifiedFiltersAtom));

    modified.delete(key);

    // If it's a date range, clear both dates
    if (key === 'timeRangePreset') {
        modified.delete('dateStart');
        modified.delete('dateEnd');
    }

    set(desktopFilterAtom, { ...current, [key]: saved[key] });
    set(modifiedFiltersAtom, Array.from(modified));
});

/** Write-only: Reset current filters to factory defaults */
export const resetFiltersAtom = atom(null, (_get, set) => {
    set(desktopFilterAtom, { ...FACTORY_FILTER_DEFAULTS });
    set(modifiedFiltersAtom, []); // Clear all modification markers
});

/** Selected row IDs for bulk actions (Historical view) */
export const selectedHistoryRowsAtom = atom<Set<string>>(new Set<string>());

/** Selected row IDs for live monitor */
export const selectedLiveRowsAtom = atom<Set<string>>(new Set<string>());

/** Historical checks data (mock) */
export const historicalChecksAtom = atom<HistoricalCheck[]>(enhancedMockData.historicalData);

/** Counter changed to trigger re-fetches in views */
export const historicalRefreshAtom = atom(0);

/** Derived: filtered historical checks */
export const filteredHistoricalChecksAtom = atom((get) => {
    const checks = get(historicalChecksAtom);
    const filter = get(desktopFilterAtom);

    return checks.filter((check) => {
        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            const matchesResident = check.residents.some((r) =>
                r.name.toLowerCase().includes(searchLower)
            );
            const matchesLocation = check.location.toLowerCase().includes(searchLower);
            if (!matchesResident && !matchesLocation) return false;
        }

        // Unit filter - extract unit letter from location (e.g., "A-101" → "A")
        if (filter.unit !== 'all') {
            const unitFromLocation = check.location.split('-')[0];
            if (unitFromLocation !== filter.unit) return false;
        }

        // Combined Historical Status Filter (Multi-select)
        // Empty array means "All"
        if (filter.historicalStatusFilter.length > 0) {
            const statusParams = filter.historicalStatusFilter;
            let matches = false;

            // Check if check status matches any selected filter
            if (statusParams.includes('missed-not-reviewed')) {
                if (check.status === 'missed' && !check.supervisorNote) matches = true;
            }
            if (statusParams.includes('missed-reviewed')) {
                if (check.status === 'missed' && !!check.supervisorNote) matches = true;
            }
            if (statusParams.includes('completed')) {
                if (check.status === 'completed') matches = true;
            }
            if (statusParams.includes('completed-late')) {
                if (check.status === 'completed-late') matches = true;
            }

            if (!matches) return false;
        }

        // Officer filter
        if (filter.officer) {
            if (!check.officerName.toLowerCase().includes(filter.officer.toLowerCase())) return false;
        }

        // Advanced Date filters
        const checkDate = check.scheduledTime.split('T')[0];
        if (filter.startDate && checkDate < filter.startDate) return false;
        if (filter.endDate && checkDate > filter.endDate) return false;

        // Special Status filter
        if (filter.enhancedObservation !== 'any') {
            const hasSR = check.hasHighRisk;
            const hasMW = check.location.includes('MW'); // Mock MW logic
            if (filter.enhancedObservation === 'sr' && !hasSR) return false;
            if (filter.enhancedObservation === 'mw' && !hasMW) return false;
        }

        // Comment filters
        if (filter.commentFilter !== 'any') {
            const hasNote = !!check.supervisorNote;
            if (filter.commentFilter === 'has' && !hasNote) return false;
            if (filter.commentFilter === 'none' && hasNote) return false;
        }

        // Resident Filter (Mock)
        if (filter.resident) {
            const resMatch = check.residents.some(r => r.name === filter.resident);
            if (!resMatch) return false;
        }

        // Reviewer Filter (Mock)
        if (filter.reviewer) {
            if (check.supervisorName !== filter.reviewer) return false;
        }

        return true;
    });
});

/** Supervisor note modal state */
export const supervisorNoteModalAtom = atom<{
    isOpen: boolean;
    selectedIds: string[];
}>({
    isOpen: false,
    selectedIds: [],
});

// ============================================================================
// INFO PANEL STATE (UNIFIED)
// ============================================================================

/**
 * The normalized data shape for the Detail Panel.
 * Adapts both LiveCheckRow and HistoricalCheck into a single interface.
 */
export interface PanelData {
    id: string;
    correlationGuid?: string;
    source: 'live' | 'historical';
    residents: Resident[];
    residentName: string;
    location: string;
    status: string; // Keep broad to handle all UI and IA statuses

    // IA-Aligned Timestamps
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    completedTime?: string | null;
    missedTime?: string | null;

    // Legacy mapping (keep for transition)
    timeScheduled: string;
    timeActual: string | null;

    varianceMinutes?: number;
    officerName?: string;
    officerNote?: string;
    supervisorNote?: string;
    supervisorName?: string;
    reviewDate?: string;
    reviewStatus?: 'pending' | 'verified';
    group?: string;
    unit?: string;
    roomIdMethod?: 'NFC' | 'QR_CODE' | 'MANUAL_ENTRY';
    // Potential future fields
    riskType?: string;
    hasHighRisk?: boolean;
}

/** 
 * Holds the currently open record for the detail panel.
 * If null, panel is closed.
 */
export const activeDetailRecordAtom = atom<PanelData | null>(null);

/** Panel Visibility Atom (Preview Pane Mode / Manual Override) */
export const isDetailPanelOpenAtom = atom<boolean>(false);

/** Configuration: Auto-open panel on transient selection? (Default: false) */
export const autoOpenDetailPanelAtom = atomWithStorage<boolean>(`${STORAGE_PREFIX}auto_open_panel`, false);

/** Panel width for resize functionality (min: 320, max: 600) */
export const panelWidthAtom = atomWithStorage<number>(`${STORAGE_PREFIX}panel_width`, 320);

// ============================================================================
// AUTO-REFRESH STATE
// ============================================================================

/** Auto-refresh configuration */
export interface AutoRefreshState {
    isPaused: boolean;
    intervalSeconds: number;
    lastRefreshTime: number; // timestamp (ms)
}

export const autoRefreshAtom = atom<AutoRefreshState>({
    isPaused: false,
    intervalSeconds: 30,
    lastRefreshTime: Date.now(),
});

/** Derived: Time until next refresh (in seconds) */
export const nextRefreshSecondsAtom = atom((get) => {
    const { isPaused, intervalSeconds, lastRefreshTime } = get(autoRefreshAtom);

    if (isPaused) return null; // null = paused

    const elapsed = (Date.now() - lastRefreshTime) / 1000;
    const remaining = Math.max(0, intervalSeconds - elapsed);
    return Math.ceil(remaining);
});

// ============================================================================
// DESKTOP STATUS COUNTS
// ============================================================================

/** Desktop-specific counts for header tabs - now pulling from unified enhanced mock data */
export const desktopTabCountsAtom = atom((get) => {
    // We get historicalRefreshAtom to ensure this re-runs when data is updated via modal
    get(historicalRefreshAtom);

    // Live counts - Strictly active overdue
    const overdue = enhancedMockData.liveData.filter((c: LiveCheckRow) => c.status === 'overdue').length;
    const due = enhancedMockData.liveData.filter((c: LiveCheckRow) => c.status === 'due').length;

    // Historical count (missed / need comment)
    const unreviewed = enhancedMockData.historicalData.filter((c: HistoricalCheck) =>
        c.status === 'missed' && !c.supervisorNote
    ).length;

    return {
        // Live View badges
        missed: overdue,     // 🔔 red bell
        due: due,            // ⏰ amber clock

        // Historical View badge
        unreviewed: unreviewed, // 👤⚠ gray
    };
});

/**
 * SIDEBAR STATE
 * Persists the expanded/collapsed state of the left navigation.
 * Default: true (Expanded)
 */
export const sidebarExpandedAtom = atomWithStorage<boolean>('sidebar-expanded', true);

/**
 * SIDEBAR SEARCH
 * Tracks the current input in the sidebar search box.
 */
export const sidebarSearchQueryAtom = atom<string>('');

// ============================================================================
// RESIDENT DISPLAY SETTINGS
// ============================================================================

export type ResidentDisplayMode = 'left-badge' | 'chip' | 'right-badge';
/**
 * Controls how the resident name and status badges are rendered in the table.
 * - 'left-badge': Badges on the left, name on the right.
 * - 'chip': Name and badges combined in a rounded chip.
 * - 'right-badge': Name on the left, badges on the right.
 */
export const residentDisplayModeAtom = atomWithStorage<ResidentDisplayMode>(
    `${STORAGE_PREFIX}resident_display_mode`,
    'left-badge'
);

export type ResidentBadgeTextMode = 'full' | 'short';
/**
 * Controls the text length of warning badges (e.g. "SR" vs "Suicide risk").
 */
export const residentBadgeTextAtom = atomWithStorage<ResidentBadgeTextMode>(
    `${STORAGE_PREFIX}resident_badge_text`,
    'short'
);

/** Toggle for Officer input style (Select vs Combo Box) */
export const officerInputStyleAtom = atomWithStorage<'select' | 'combo'>('officer-input-style', 'select');

/** Toggle for dimmed location breadcrumbs in tables (Group/Unit secondary color) */
export const dimLocationBreadcrumbsAtom = atomWithStorage<boolean>(`${STORAGE_PREFIX}dim_location_breadcrumbs`, true);

/** Toggle for badge truncation in tables (Show +N instead of all badges) */
export const truncateBadgesAtom = atomWithStorage<boolean>(`${STORAGE_PREFIX}truncate_badges`, false);

/** Toggle for table font weight: 'medium' (default) or 'regular' */
export const tableFontWeightAtom = atomWithStorage<'medium' | 'regular'>(`${STORAGE_PREFIX}table_font_weight`, 'regular');

/** Toggle for requiring a reason when adding a supervisor note */
export const requireSupervisorNoteReasonAtom = atomWithStorage<boolean>(`${STORAGE_PREFIX}require_supervisor_note_reason`, true);

export type ReasonSelectionMode = 'ghost' | 'none' | 'inline';
/** Mode for clearing reason selection: 'ghost' (blank item), 'none' (explicit item), or 'inline' (X button) */
export const reasonSelectionModeAtom = atomWithStorage<ReasonSelectionMode>(`${STORAGE_PREFIX}reason_selection_mode`, 'none');

/** Global state to track if the current view has zero results (for header title sync) */
export const isNoResultsAtom = atom(false);

/** Toggle for showing seconds in timestamp tables */
export const timestampPrecisionModeAtom = atomWithStorage<'minutes' | 'seconds'>(
    `${STORAGE_PREFIX}timestamp_precision_mode`,
    'minutes'
);

/** Toggle for showing more precise tooltip timestamps (Long Date, Long Time + TZ) */
export const preciseTooltipAtom = atomWithStorage<boolean>(
    `${STORAGE_PREFIX}precise_tooltip`,
    false
);

