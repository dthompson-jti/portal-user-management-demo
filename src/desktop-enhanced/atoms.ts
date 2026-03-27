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

// Access Ledger detail panel state
export const portalInspectedRecordAtom = atom<PortalAccessRecord | null>(null);
export const portalSelectedCountAtom = atom<number>(0);
