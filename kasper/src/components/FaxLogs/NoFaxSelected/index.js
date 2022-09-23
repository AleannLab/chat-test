import React from 'react';
import { ReactComponent as NoSelectionIllustration } from 'assets/images/no-fax-selected.svg';
import styles from './index.module.css';

const NoFaxSelected = () => {
  return (
    <div className="d-flex flex-grow-1 align-items-center justify-content-center">
      <div className={styles.innerContainer}>
        <NoSelectionIllustration />
        <span className={styles.text}>No Fax Selected</span>
      </div>
    </div>
  );
};

export default NoFaxSelected;
