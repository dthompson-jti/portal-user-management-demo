import React, { useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { sidebarExpandedAtom, sidebarSearchQueryAtom } from '../../atoms';
import { activePageAtom, ActivePage } from '../../../data/activePageAtom';
import { SearchController } from './SearchController';
import { LeftNavigationSection } from './LeftNavigationSection';
import { LeftNavigationSubSection } from './LeftNavigationSubSection';
import { LeftNavigationLinkItem } from './LeftNavigationLinkItem';
import { LeftNavigationSubTitle } from './LeftNavigationSubTitle';
import { Divider } from './Divider';
import styles from './SideBar.module.css';

interface NavNode {
    type: 'section' | 'sub-section' | 'link' | 'sub-title' | 'divider';
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    action?: () => void;
    children?: NavNode[];
}

const NAVIGATION_DATA: NavNode[] = [
    {
        type: 'section',
        id: 'quick-access',
        label: 'Quick Access',
        children: [
            { type: 'link', id: 'settings', label: 'System Properties' },
            { type: 'link', id: 'settings-tabs', label: 'System Properties (Tabs)' },
            { type: 'link', id: 'action-items', label: 'Action Items' },
            { type: 'link', id: '22stcp00011', label: '22STCP00011' },
            { type: 'link', id: '22stcp00013', label: '22STCP00013' },
            { type: 'link', id: 'open-till', label: 'Open Till' },
            { type: 'link', id: 'close-till', label: 'Close Till' },
        ]
    },
    {
        type: 'section',
        id: 'portal-mgmt',
        label: 'Portal Management',
        children: [
            { type: 'link', id: 'portal-case-search', label: 'search by case' },
            { type: 'link', id: 'portal-email-search', label: 'Search by Email' },
        ]
    },
    {
        type: 'section',
        id: 'workspace',
        label: 'Workspace',
        children: [
            { type: 'link', id: 'ws-action-items', label: 'Action Items' },
            { type: 'link', id: 'barcode-scanning', label: 'Barcode Scanning' },
            { type: 'link', id: 'scan-print-test', label: 'Scan / Print Test' },
        ]
    },
    {
        type: 'sub-section',
        id: 'recent-cases',
        label: 'Recent Cases',
        children: [
            { type: 'link', id: 'rc-22stcp00011', label: '22STCP00011' },
            { type: 'link', id: 'rc-22stcp00013', label: '22STCP00013' },
            { type: 'link', id: 'rc-22stcp00062', label: '22STCP00062' },
            { type: 'link', id: 'rc-22stcp00007', label: '22STCP00007' },
            { type: 'link', id: 'rc-22stcp00002', label: '22STCP00002' },
            { type: 'link', id: 'rc-22stcp00022', label: '22STCP00022' },
            { type: 'link', id: 'rc-22stcp00005', label: '22STCP00005' },
            { type: 'link', id: 'rc-22stcp00003', label: '22STCP00003' },
            { type: 'link', id: 'rc-22stcp00007-2', label: '22STCP00007' },
        ]
    },
    {
        type: 'sub-section',
        id: 'calendar',
        label: 'Calendar',
        children: [
            { type: 'link', id: 'daily-calendar', label: 'Daily Calendar' },
            { type: 'link', id: 'weekly-calendar', label: 'Weekly Calendar' },
            { type: 'link', id: 'monthly-calendar', label: 'Monthly Calendar' },
            { type: 'link', id: 'global-calendar', label: 'Global Calendar' },
            { type: 'divider', id: 'cal-div', label: '' },
            { type: 'link', id: 'filing-window', label: 'Filing Window' },
            { type: 'link', id: 'cal-open-till', label: 'Open Till' },
            { type: 'link', id: 'cal-close-till', label: 'Close Till' },
        ]
    },
    {
        type: 'sub-section',
        id: 'notes-library',
        label: 'Notes Library',
        children: [
            { type: 'link', id: 'notes-item-001', label: 'Notes Item 001' },
            { type: 'link', id: 'notes-item-002', label: 'Notes Item 002' },
            { type: 'link', id: 'notes-item-003', label: 'Notes Item 003' },
            { type: 'link', id: 'notes-item-004', label: 'Notes Item 004' },
            { type: 'divider', id: 'notes-div', label: '' },
            { type: 'link', id: 'saved-searches', label: 'Saved Searches' },
            { type: 'link', id: 'code-civil-procedure', label: 'Code of Civil Procedure' },
            { type: 'link', id: 'ca-rules-court', label: 'CA Rules of Court' },
            { type: 'link', id: 'local-court-rules', label: 'Local Court Rules' },
            { type: 'link', id: 'lexis-nexis', label: 'Lexis/Nexis' },
            { type: 'link', id: 'westlaw', label: 'WestLaw' },
            { type: 'link', id: 'nsf-list', label: 'NSF List' },
        ]
    },
    { type: 'section', id: 'case-initiation', label: 'Case Initiation', children: [] },
    { type: 'section', id: 'cases', label: 'Cases', children: [] },
    { type: 'section', id: 'searches', label: 'Searches', children: [] },
    { type: 'section', id: 'reports', label: 'Reports', children: [] },
    { type: 'section', id: 'mass-entry', label: 'Mass Entry', children: [] },
    { type: 'section', id: 'interfaces', label: 'Interfaces', children: [] },
    { type: 'section', id: 'interpreter-services', label: 'Interpreter Services', children: [] },
    { type: 'section', id: 'admin-tasks', label: 'Admin Tasks', children: [] },
    { type: 'section', id: 'jbsis-stats', label: 'JBSIS & Stats', children: [] },
    { type: 'section', id: 'config-reports', label: 'Config Reports', children: [] },
    { type: 'section', id: 'supervisors', label: 'Supervisors', children: [] },
    { type: 'section', id: 'crs', label: 'CRS', children: [] },
];

export function SideBar() {
    const isExpanded = useAtomValue(sidebarExpandedAtom);
    const searchQuery = useAtomValue(sidebarSearchQueryAtom);
    const [activePage, setActivePage] = useAtom(activePageAtom);

    const filteredData = useMemo(() => {
        if (!searchQuery) return NAVIGATION_DATA;

        const filterNodes = (nodes: NavNode[]): NavNode[] | null => {
            const results: NavNode[] = [];

            for (const node of nodes) {
                if (node.type === 'link' || node.type === 'sub-title') {
                    if (node.label.toLowerCase().includes(searchQuery.toLowerCase())) {
                        results.push(node);
                    }
                } else if (node.children) {
                    const matchedChildren = filterNodes(node.children);
                    if (matchedChildren && matchedChildren.length > 0) {
                        results.push({ ...node, children: matchedChildren });
                    }
                } else if (node.type === 'section' || node.type === 'sub-section') {
                    // Even if header doesn't match, children might. Handled above.
                } else {
                    // Dividers etc
                    results.push(node);
                }
            }

            return results.length > 0 ? results : null;
        };

        return filterNodes(NAVIGATION_DATA) || [];
    }, [searchQuery]);

    const renderNode = (node: NavNode, depth: number = 0) => {
        const nextDepth = depth + 1; // Increment for children

        switch (node.type) {
            case 'section':
                return (
                    <LeftNavigationSection key={node.id} label={node.label}>
                        {node.children?.map(child => renderNode(child, nextDepth))}
                    </LeftNavigationSection>
                );
            case 'sub-section':
                return (
                    <LeftNavigationSubSection key={node.id} label={node.label} level={depth}>
                        {node.children?.map(child => renderNode(child, nextDepth))}
                    </LeftNavigationSubSection>
                );
            case 'link': {
                const isSettings = node.id === 'settings';
                const isSelected = isSettings
                    ? activePage === 'settings'
                    : activePage === node.id;
                return (
                    <LeftNavigationLinkItem
                        key={node.id}
                        label={node.label}
                        icon={node.icon}
                        href="#"
                        selected={isSelected}
                        onClick={(e) => {
                            e.preventDefault();
                            if (node.id === 'settings') setActivePage('settings');
                            else if (node.id === 'settings-tabs') setActivePage('settings-tabs');
                            else if (node.id.startsWith('portal-')) setActivePage(node.id as ActivePage);
                        }}
                        level={depth}
                    />
                );
            }
            case 'sub-title':
                return <LeftNavigationSubTitle key={node.id} label={node.label} level={depth} />;
            case 'divider':
                return <Divider key={node.id} />;
            default:
                return null;
        }
    };

    return (
        <nav
            className={styles.container}
            data-collapsed={!isExpanded}
            aria-label="Main Navigation"
        >
            <SearchController />
            <div className={styles.scrollArea}>
                {filteredData.map(renderNode)}
            </div>
        </nav>
    );
}
