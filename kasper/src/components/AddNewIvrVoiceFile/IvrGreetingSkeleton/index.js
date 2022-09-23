import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import Divider from '@material-ui/core/Divider';

import styles from './index.module.css';

const IvrGreetingSkeleton = () => {
  return (
    <div>
      <div className={styles.ivrGreetingSingleGreeting}>
        <Skeleton variant="rect" animation="wave" width="70%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
      </div>
      <Divider />
    </div>
  );
};

export default IvrGreetingSkeleton;
