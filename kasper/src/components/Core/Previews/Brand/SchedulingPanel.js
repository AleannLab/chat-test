import { Grid } from '@material-ui/core';
import React from 'react';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { Skeleton } from '@material-ui/lab';
import PropTypes from 'prop-types';
import styles from './index.module.css';

const SchedulingPanel = React.memo(({ primaryColor, secondaryColor }) => (
  <Grid container spacing={2} className={styles.panel}>
    <Grid item xs={9} style={{ padding: 0 }}>
      <div className={styles.calendarHeader}>
        <ChevronLeftIcon className={styles.navIcon} />
        <Skeleton
          variant="rect"
          animation={false}
          width={68}
          height={7}
        ></Skeleton>
        <ChevronRightIcon className={styles.navIcon} />
      </div>
      <div className={styles.grid}>
        {[...Array(7)].map((ele, index) => (
          <Skeleton
            key={`day-${index}`}
            variant="rect"
            width={10}
            height={4}
            animation={false}
            style={{ margin: '0 auto' }}
          />
        ))}
        {[...Array(42)].map((ele, index) => (
          <Skeleton
            key={index}
            variant="rect"
            animation={false}
            style={{
              backgroundColor: [5, 25].includes(index) && secondaryColor,
              border: 25 === index && `solid 0.5px ${primaryColor}`,
            }}
          />
        ))}
      </div>
    </Grid>
    <Grid item xs={3} style={{ padding: 0 }}>
      <div
        style={{
          border: `solid 1px ${primaryColor}`,
          backgroundColor: secondaryColor,
        }}
        className={styles.slot}
      >
        <Skeleton
          variant="rect"
          animation={false}
          width="70%"
          height={4}
          style={{ backgroundColor: primaryColor }}
        ></Skeleton>
      </div>
      {[...Array(6)].map((ele, index) => (
        <div key={`slot-${index}`} className={styles.slot}>
          <Skeleton
            variant="rect"
            animation={false}
            width="70%"
            height={4}
          ></Skeleton>
        </div>
      ))}
    </Grid>
    <Grid item xs={12} style={{ padding: 0 }}>
      <div className={styles.messageBox}>
        <Skeleton
          variant="rect"
          animation={false}
          width={92}
          height={4}
        ></Skeleton>
        <Skeleton
          variant="rect"
          animation={false}
          width={46}
          height={12}
          style={{ marginLeft: 'auto', backgroundColor: primaryColor }}
        ></Skeleton>
      </div>
    </Grid>
  </Grid>
));

SchedulingPanel.displayName = 'SchedulingPanel';

SchedulingPanel.propTypes = {
  primaryColor: PropTypes.string.isRequired,
  secondaryColor: PropTypes.string.isRequired,
};
export default SchedulingPanel;
