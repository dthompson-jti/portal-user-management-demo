import React from 'react';
import { SettingsBreadcrumbs } from './SettingsBreadcrumbs';
import { SettingsContent } from './SettingsContent';
import { trackEvent } from '../../../analytics';
import styles from './SettingsPage.module.css';

export const SettingsPage: React.FC = () => {
  const handleSave = () => {
    trackEvent('settings_saved', { source: 'standard' });
  };

  const handleCancel = () => {
    trackEvent('settings_cancelled', { source: 'standard' });
  };

  return (
    <div className={styles.container}>
      <SettingsBreadcrumbs />
      <div className={styles.contentScrollArea}>
        <SettingsContent />
      </div>
      <div className={styles.footer}>
        <div className={styles.footerActions}>
          <button 
            className="btn" 
            data-variant="primary" 
            data-size="m"
            onClick={handleSave}
          >
            Save
          </button>
          <button 
            className="btn" 
            data-variant="tertiary" 
            data-size="m"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
