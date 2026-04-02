import React, { useState } from 'react';
import { SplitButton, SplitButtonMenuItem } from '../../components/SplitButton';
import { Button } from '../../components/Button';
import { OverviewBadge } from '../../components/OverviewBadge';
import styles from './CaseHeader.module.css';

interface OverviewStat {
    icon: string;
    label: string;
    value: string;
    variant: 'success' | 'alert' | 'warning' | 'info';
}

interface CaseHeaderProps {
    caseNumber: string;
    courtLocation: string;
    caseTitle: string;
    caseType: string;
    overviewBadges?: OverviewStat[];
}

type SectionKey = 'summary' | 'parties' | 'documents' | 'hearings' | 'judgments' | 'financials' | 'timeline';

interface ToolbarSection {
    key: SectionKey;
    label: string;
    icon?: string;
    items?: SplitButtonMenuItem[];
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
    caseNumber,
    courtLocation,
    caseTitle,
    caseType,
    overviewBadges,
}) => {
    const [activeSection, setActiveSection] = useState<SectionKey>('parties');

    const toolbarSections: ToolbarSection[] = [
        {
            key: 'summary',
            label: 'Summary',
            icon: 'summarize',
            items: [
                { label: 'View summary' },
                { label: 'Edit summary' },
            ],
        },
        {
            key: 'parties',
            label: 'Parties',
            icon: 'group',
            items: [
                { label: 'Add party' },
                { label: 'Add legal representative' },
                { label: 'Portal User Access', isActive: activeSection === 'parties' },
            ],
        },
        {
            key: 'documents',
            label: 'Documents',
            icon: 'description',
            items: [
                { label: 'Upload document' },
                { label: 'Search documents' },
            ],
        },
        {
            key: 'hearings',
            label: 'Hearings',
            icon: 'gavel',
            items: [
                { label: 'Schedule hearing' },
                { label: 'View calendar' },
            ],
        },
        {
            key: 'judgments',
            label: 'Judgments',
            icon: 'balance',
            items: [
                { label: 'Record judgment' },
                { label: 'View judgments' },
            ],
        },
        {
            key: 'financials',
            label: 'Financials',
            icon: 'payments',
            items: [
                { label: 'Record payment' },
                { label: 'View ledger' },
            ],
        },
    ];

    return (
        <div className={styles.caseHeader}>
            {/* Info Block */}
            <div className={styles.infoRow}>
                <div>
                    <div className={styles.topRow}>
                        <h2 className={styles.caseNumber}>{caseNumber}</h2>
                        <span className={styles.courtLocation}>{courtLocation}</span>
                    </div>
                    <p className={styles.caseTitle}>{caseTitle}</p>
                    <p className={styles.caseType}>{caseType}</p>
                </div>
                {overviewBadges && overviewBadges.length > 0 && (
                    <div className={styles.overviewBadges}>
                        {overviewBadges.map((badge) => (
                            <OverviewBadge
                                key={badge.label}
                                icon={badge.icon}
                                label={badge.label}
                                value={badge.value}
                                variant={badge.variant}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                {toolbarSections.map((section) => (
                    <SplitButton
                        key={section.key}
                        label={section.label}
                        active={activeSection === section.key}
                        onClick={() => setActiveSection(section.key)}
                        items={(section.items ?? []).map(item => ({
                            ...item,
                            isActive: item.isActive || false,
                            onClick: () => setActiveSection(section.key),
                        }))}
                    />
                ))}
                <Button
                    variant="secondary"
                    size="s"
                    active={activeSection === 'timeline'}
                    onClick={() => setActiveSection('timeline')}
                >
                    Timeline
                </Button>
            </div>
        </div>
    );
};
