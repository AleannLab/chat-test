import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import Divider from '@material-ui/core/Divider';

import styles from './index.module.css';

const CallForwardingSkeleton = () => {
  return (
    <div>
      <div className={styles.singleItem}>
        <Skeleton variant="rect" animation="wave" width="30%" height={15} />
        <Skeleton variant="rect" animation="wave" width="30%" height={15} />
        <Skeleton variant="rect" animation="wave" width="10%" height={15} />
        <Skeleton variant="rect" animation="wave" width="10%" height={15} />
      </div>
      <Divider className="mt-4 mb-4" />
    </div>
  );
};

export default CallForwardingSkeleton;
