import React from 'react';
import { useAtomValue } from 'jotai';
import { activePageAtom } from '../../data/activePageAtom';
import { PortalLandingPage } from './PortalLandingPage';
import { PortalOmnisearch } from './PortalOmnisearch';
import styles from './PortalManagementView.module.css';

export const PortalManagementView: React.FC = () => {
    const activePage = useAtomValue(activePageAtom);

    const renderContent = () => {
        switch (activePage) {
            case 'portal-home':
                return <PortalLandingPage />;
            case 'portal-email-search':
                return <PortalOmnisearch key="email" mode="email" />;
            case 'portal-case-search':
                return <PortalOmnisearch key="case" mode="case" />;
            default:
                return <PortalLandingPage />;
        }
    };

    return (
        <div className={styles.viewWrapper}>
            {renderContent()}
        </div>
    );
};
