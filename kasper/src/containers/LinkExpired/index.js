import React from 'react';
import { ReactComponent as LinkExpiredBaner } from '../../assets/images/invalid-link.svg';
import { ReactComponent as CardLogo } from '../../assets/images/powered-by-kasper-color.svg';

import styles from './index.module.css';

const LinkExpired = () => {
  return (
    <div className={styles.container}>
      <div className={styles.linkExpiredBaner}>
        <LinkExpiredBaner />
        <span>This link is no longer valid</span>
      </div>
      <div className={styles.cardLogo}>
        <CardLogo />
      </div>
    </div>
  );
};

export default LinkExpired;
