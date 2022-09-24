import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import styles from './index.module.css';

const IvrSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <Skeleton
        className={styles.skeletonCircle}
        variant="circle"
        height={40}
        width={40}
      />
      <Skeleton
        className={styles.skeletonPrimary}
        color="red"
        variant="rect"
        height={52}
      />
      <Skeleton className={styles.skeleton} variant="rect" height={43} />
      <Skeleton className={styles.skeleton} variant="rect" height={43} />
      <div className="ms-4 mt-2">
        <Skeleton
          className={`${styles.skeletonPrimary} ${styles.skeleton}`}
          variant="rect"
          height={52}
        />
        <Skeleton className={styles.skeleton} variant="rect" height={43} />
        <Skeleton className={styles.skeleton} variant="rect" height={43} />
      </div>
    </div>
  );
};

export default IvrSkeleton;
