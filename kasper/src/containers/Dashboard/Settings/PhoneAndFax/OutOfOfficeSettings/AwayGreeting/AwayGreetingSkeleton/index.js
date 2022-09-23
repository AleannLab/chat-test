import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import Divider from '@material-ui/core/Divider';

import styles from './index.module.css';

const AwayGreetingSkeleton = () => {
  return (
    <div>
      <div className={styles.awayGreetingSingleGreeting}>
        <Skeleton variant="rect" animation="wave" width="70%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
        <Skeleton variant="rect" animation="wave" width="4%" height={15} />
      </div>
      <Divider className="mt-4 mb-4" />
    </div>
  );
};

export default AwayGreetingSkeleton;
