import React from 'react';
import styles from '../index.module.css';
import { DayView } from '@devexpress/dx-react-scheduler-material-ui';

const CustomDayViewLayout = (props) => {
  return (
    <DayView.Layout {...props} className={styles.dayViewLayoutContainer} />
  );
};

export default React.memo(CustomDayViewLayout);
