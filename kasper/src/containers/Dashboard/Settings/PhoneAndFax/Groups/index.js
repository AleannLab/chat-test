import React from 'react';
import styles from './index.module.css';
import GroupsList from './GroupsList';

const Groups = () => {
  return (
    <div className={styles.root}>
      <div className={styles.header}>Call Groups</div>
      <div className={styles.info}>You can set up phone call groups</div>
      <div className={styles.sectionContainer}>
        <GroupsList />
      </div>
    </div>
  );
};

export default Groups;
