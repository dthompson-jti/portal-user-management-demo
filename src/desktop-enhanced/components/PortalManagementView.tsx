import React from 'react';
import { useAtomValue } from 'jotai';
import { activePageAtom } from '../../data/activePageAtom';
import { PortalOmnisearch } from './PortalOmnisearch';
import { PortalCaseAccessManager } from './PortalCaseAccessManager';
import { AccessLedger } from './AccessLedger';
import styles from './PortalManagementView.module.css';

export const PortalManagementView: React.FC = () => {
    const activePage = useAtomValue(activePageAtom);

    const renderContent = () => {
        switch (activePage) {
            case 'portal-email-search':
                return <PortalOmnisearch mode="email" />;
            case 'portal-case-search':
                return <PortalOmnisearch mode="case" />;
            case 'portal-case-example':
                return <PortalCaseAccessManager caseNum="CIV-24-0000013" />;
            case 'portal-access-ledger':
                return <AccessLedger />;
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
