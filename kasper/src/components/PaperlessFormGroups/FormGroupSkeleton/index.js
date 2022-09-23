import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

import styles from './index.module.css';

const FormGroupSkeleton = () => (
  <div className={styles.group}>
    <Skeleton variant="rect" width="80%" height={8} animation="wave" />
    <div className="ms-auto">
      <Skeleton variant="rect" width={15} height={8} animation="wave" />
    </div>
  </div>
);

export default FormGroupSkeleton;
