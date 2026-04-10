import React from 'react';
import { useSetAtom } from 'jotai';
import { activePageAtom } from '../../data/activePageAtom';
import { Button } from '../../components/Button';
import styles from './PortalLandingPage.module.css';

export const PortalLandingPage: React.FC = () => {
    const setActivePage = useSetAtom(activePageAtom);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <p className={styles.eyebrow}>Portal prototype</p>
                <h1 className={styles.title}>Choose a search scenario</h1>
                <p className={styles.subtitle}>Each scenario opens as its own full page search experience.</p>
            </div>

            <div className={styles.cardGrid}>
                <section className={styles.card}>
                    <div className={styles.cardMeta}>Scenario 01</div>
                    <h2 className={styles.cardTitle}>Search by case</h2>
                    <p className={styles.cardCopy}>Review access by case id and scan the participant list from there.</p>
                    <div className={styles.cardAction}>
                        <Button variant="primary" size="m" onClick={() => setActivePage('portal-case-search')}>
                            Launch case Search
                        </Button>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardMeta}>Scenario 02</div>
                    <h2 className={styles.cardTitle}>Search by email</h2>
                    <p className={styles.cardCopy}>Start with a known address and inspect every related access record.</p>
                    <div className={styles.cardAction}>
                        <Button variant="secondary" size="m" onClick={() => setActivePage('portal-email-search')}>
                            Launch email Search
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
};
