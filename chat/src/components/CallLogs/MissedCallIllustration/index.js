import React from 'react';
import { ReactComponent as Illustration } from 'assets/images/missed-call-illustration.svg';
import styles from './index.module.css';

const MissedCallIllustration = () => {
  return (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      <div className={styles.innerContainer}>
        <Illustration />
        <span className={styles.text}>You have a missed call</span>
      </div>
    </div>
  );
};

export default MissedCallIllustration;
