import { atom } from 'jotai';

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
