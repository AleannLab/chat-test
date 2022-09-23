import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

import styles from './index.module.css';

const ConfigSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.option}>
        <Skeleton variant="rect" animation="wave" width="15%" height={25} />
        <Skeleton variant="rect" animation="wave" width="58%" height={25} />
      </div>
      <div className={styles.option}>
        <Skeleton variant="rect" animation="wave" width="15%" height={25} />
        <Skeleton variant="rect" animation="wave" width="58%" height={25} />
      </div>
    </div>
  );
};

export default ConfigSkeleton;
