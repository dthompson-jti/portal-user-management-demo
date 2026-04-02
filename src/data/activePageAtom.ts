import { atom } from 'jotai';

export type ActivePage =
  | 'checks'
  | 'settings'
  | 'settings-tabs'
  | 'portal-email-search'
  | 'portal-case-search'
  | 'portal-case-example'
  | 'portal-omnisearch'
  | 'portal-email-search-partial'
  | 'portal-case-search-partial'
  | 'portal-access-ledger'
  | 'portal-access';

/** Top-level page routing — NOT the same as desktopViewAtom (live/historical) */
export const activePageAtom = atom<ActivePage>('portal-email-search');
