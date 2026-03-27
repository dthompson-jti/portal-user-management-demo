import React from 'react';
import { useAtomValue } from 'jotai';
import { activePageAtom } from '../../data/activePageAtom';
import { PortalEmailSearch } from './PortalEmailSearch';
import { PortalCaseSearch } from './PortalCaseSearch';
import { AccessLedger } from './AccessLedger';
import styles from './PortalManagementView.module.css';

export const PortalManagementView: React.FC = () => {
    const activePage = useAtomValue(activePageAtom);

    const renderContent = () => {
        switch (activePage) {
            case 'portal-email-search':
                return <PortalEmailSearch />;
            case 'portal-case-search':
                return <PortalCaseSearch />;
            case 'portal-case-example':
                return <PortalCaseSearch isInsideCase={true} caseNum="CIV-24-0000013" />;
            case 'portal-access-ledger':
                return <AccessLedger />;
            default:
                return <PortalEmailSearch />;
        }
    };

    return (
        <div className={styles.viewWrapper}>
            {renderContent()}
        </div>
    );
};
