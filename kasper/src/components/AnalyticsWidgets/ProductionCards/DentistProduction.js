import React from 'react';
import styles from './index.module.css';
import { convertToCurrency } from 'helpers/misc';
import GrowthIndicator from 'components/AnalyticsWidgets/GrowthIndicator';

const DentistProduction = ({ current, past }) => {
  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <div className={styles.title}>
          <span>Dentist Production</span>
        </div>
        <div className="d-flex">
          <span className={styles.mainText}>{convertToCurrency(current)}</span>
          <GrowthIndicator
            target={past}
            achieved={current}
            formatter={convertToCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default DentistProduction;
