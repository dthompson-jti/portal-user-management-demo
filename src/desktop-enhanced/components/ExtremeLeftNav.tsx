import React from 'react';
import styles from './ExtremeLeftNav.module.css';

export const ExtremeLeftNav: React.FC = () => {
    return (
        <div className={styles.extremeLeftNav}>
            <img
                src="/safety-check-desktop/left-nav-wireframe.png"
                alt="Navigation Menu"
                className={styles.navImage}
            />
        </div>
    );
};
