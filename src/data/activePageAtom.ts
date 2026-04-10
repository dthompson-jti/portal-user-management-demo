import { atom } from 'jotai';

export type ActivePage =
  | 'checks'
  | 'settings'
  | 'settings-tabs'
  | 'portal-home'
  | 'portal-email-search'
  | 'portal-case-search'
  | 'portal-case-example'
  | 'portal-omnisearch'
  | 'portal-email-search-partial'
  | 'portal-case-search-partial'
  | 'portal-access-ledger'
  | 'portal-access'
  | 'portal-split-pane'
  | 'portal-case-search-ii';

/** Top-level page routing — NOT the same as desktopViewAtom (live/historical) */
export const activePageAtom = atom<ActivePage>('portal-home');
