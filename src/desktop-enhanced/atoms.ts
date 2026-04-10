import { atom } from 'jotai';
import { PortalAccessRecord } from './types/portalTypes';
import { INITIAL_PORTAL_RESULTS } from './data/portalMockData';

export type DesktopEnhancedView = 'live' | 'historical';

export type SelectionType = 'root' | 'group' | 'unit';
export interface SelectionState {
    type: SelectionType;
    id: string;
    parentId?: string;
}

export const desktopEnhancedSelectionAtom = atom<SelectionState>({
    type: 'root',
    id: 'root',
});

// Expanded tree nodes (Set of IDs)
export const desktopEnhancedExpandedNodesAtom = atom<Set<string>>(new Set<string>());

// Width of the left navigation panel
export const desktopEnhancedPanelWidthAtom = atom<number>(320);

// Tree layout configuration
export type TreeLayoutMode = 'indented' | 'full-width';
export const desktopEnhancedTreeLayoutAtom = atom<TreeLayoutMode>('full-width');

// Missed count mode: 'checks' = total missed checks (current), 'rooms' = number of rooms with missed checks
export type MissedCountMode = 'checks' | 'rooms';
export const missedCountModeAtom = atom<MissedCountMode>('rooms');

// Chrome trim style: 'default' = tertiary bg, 'elevated' = lighter in dark mode
export type ChromeStyle = 'default' | 'elevated';
export const chromeStyleAtom = atom<ChromeStyle>('default');

export type PortalDensityMode = 'compact' | 'quick-actions';
export const portalDensityModeAtom = atom<PortalDensityMode>('compact');
// Portal Management State
export type PortalActionResult = {
    id: string;
    status: 'pending' | 'success' | 'failure';
    message?: string;
};

import { desktopFilterAtom } from '../desktop/atoms';

export const portalResultsAtom = atom<PortalAccessRecord[]>(INITIAL_PORTAL_RESULTS);

export const filteredPortalResultsAtom = atom((get) => {
    const results = get(portalResultsAtom);
    const filter = get(desktopFilterAtom);
    const search = filter.search?.toLowerCase();

    if (!search) return results;

    return results.filter(r => {
        const email = r.email?.toLowerCase() || '';
        const name = (r.caseName || '').toLowerCase();
        const caseNum = (r.caseNumber || '').toLowerCase();
        return email.includes(search) || name.includes(search) || caseNum.includes(search);
    });
});

export const isPortalActionExecutingAtom = atom<boolean>(false);
export const portalActionResultsAtom = atom<Record<string, PortalActionResult>>({});
export const isPortalAdvancedSearchOpenAtom = atom<boolean>(false);

// Access Ledger detail panel state
export const portalInspectedRecordAtom = atom<PortalAccessRecord | null>(null);
export const portalSelectedCountAtom = atom<number>(0);

// Split Pane state
export type SplitPaneSearchMode = 'email' | 'case';
export const splitPaneSearchModeAtom = atom<SplitPaneSearchMode>('email');
export const splitPaneSelectedItemAtom = atom<string | null>(null);
export const splitPaneWidthAtom = atom<number>(300);

// Portal primary view display settings
export type PortalCaseBadgeMode = 'off' | 'summary' | 'detailed';
export const portalCaseBadgeModeAtom = atom<PortalCaseBadgeMode>('summary');

export const portalLedgerHeaderVisibleAtom = atom<boolean>(true);
export const portalLedgerFooterVisibleAtom = atom<boolean>(false);
export const portalLedgerSummaryBadgesVisibleAtom = atom<boolean>(true);

// ── Terminology settings ──
export type StatusTerminology =
    | 'portal-access'   // Portal access / No portal access
    | 'active-inactive' // Active / Inactive
    | 'granted'         // Granted / Not granted
    | 'has-access';     // Has access / No access

export type ColumnHeaderTerminology =
    | 'status'          // Status
    | 'access-status'   // Access Status
    | 'portal-access';  // Portal Access

export interface TerminologyConfig {
    statusLabels: StatusTerminology;
    columnHeader: ColumnHeaderTerminology;
}

export const STATUS_LABEL_OPTIONS: { value: StatusTerminology; activeLabel: string; inactiveLabel: string }[] = [
    { value: 'portal-access',   activeLabel: 'Portal access',  inactiveLabel: 'No portal access' },
    { value: 'active-inactive', activeLabel: 'Active',         inactiveLabel: 'Inactive' },
    { value: 'granted',         activeLabel: 'Granted',        inactiveLabel: 'Not granted' },
    { value: 'has-access',      activeLabel: 'Has access',     inactiveLabel: 'No access' },
];

export const COLUMN_HEADER_OPTIONS: { value: ColumnHeaderTerminology; label: string }[] = [
    { value: 'status',         label: 'Status' },
    { value: 'access-status',  label: 'Access Status' },
    { value: 'portal-access',  label: 'Portal Access' },
];

export const terminologyAtom = atom<TerminologyConfig>({
    statusLabels: 'active-inactive',
    columnHeader: 'portal-access',
});
