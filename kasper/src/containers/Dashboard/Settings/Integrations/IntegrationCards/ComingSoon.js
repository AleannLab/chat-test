import React from 'react';
import styles from './index.module.css';
import { ReactComponent as IntegrationIcon } from 'assets/images/integration.svg';

export default function Swell() {
  return (
    <div
      className={`${styles.root} d-flex flex-column align-items-center justify-content-center`}
    >
      <IntegrationIcon />
      <div className={`${styles.titleSecondary} mt-4 mb-2`}>
        More integrations coming soon!
      </div>
    </div>
  );
}
