import React from 'react';
import { useAtomValue } from 'jotai';
import { activePageAtom } from '../../data/activePageAtom';
import { PortalOmnisearch } from './PortalOmnisearch';
import { PortalCaseAccessManager } from './PortalCaseAccessManager';
import { AccessLedger } from './AccessLedger';
import { PortalAccess } from './PortalAccess';
import styles from './PortalManagementView.module.css';

export const PortalManagementView: React.FC = () => {
    const activePage = useAtomValue(activePageAtom);

    const renderContent = () => {
        switch (activePage) {
            case 'portal-email-search':
                return <PortalOmnisearch key="email" mode="email" />;
            case 'portal-case-search':
                return <PortalOmnisearch key="case" mode="case" />;
            case 'portal-email-search-partial':
                return <PortalOmnisearch key="email-partial" mode="email" matchMode="partial" resultLayout="email-first" />;
            case 'portal-case-search-partial':
                return <PortalOmnisearch key="case-partial" mode="case" matchMode="partial" resultLayout="case-email" />;
            case 'portal-omnisearch':
                return <PortalOmnisearch key="omni" />;
            case 'portal-case-example':
                return <PortalCaseAccessManager caseNum="CIV-24-0000016" />;
            case 'portal-access-ledger':
                return <AccessLedger />;
            case 'portal-access':
                return <PortalAccess />;
            default:
                return <PortalOmnisearch />;
        }
    };

    return (
        <div className={styles.viewWrapper}>
            {renderContent()}
        </div>
    );
};
