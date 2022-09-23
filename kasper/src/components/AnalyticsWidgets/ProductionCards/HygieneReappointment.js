import React from 'react';
import styles from './index.module.css';
import GrowthIndicator from 'components/AnalyticsWidgets/GrowthIndicator';

const HygieneReappointment = ({ current, past }) => {
  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.title}>
          <span>Hygiene Reappointment</span>
        </div>
        <div className="d-flex">
          <span className={styles.mainText}>{(+current).toFixed(2)}%</span>
          <GrowthIndicator
            target={past}
            achieved={current}
            formatter={(val) => (+val).toFixed(2) + '%'}
          />
        </div>
      </div>
    </div>
  );
};

export default HygieneReappointment;
