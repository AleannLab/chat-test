import React from 'react';
import styles from './index.module.css';
import Skeleton from '@material-ui/lab/Skeleton';

const OfficeChatSkeleton = () => {
  const messagesCount = 6;
  return (
    <div className={styles.skeletonRoot}>
      {[...new Array(messagesCount)].map((message, index) =>
        index % 2 ? (
          <div key={index} className={styles.leftMessage}>
            <Skeleton
              animation="wave"
              variant="circle"
              width={40}
              height={40}
            />
            <div className={styles.message}>
              <Skeleton
                animation="wave"
                height={10}
                width="60%"
                className={styles.title}
              />
              <Skeleton
                animation="wave"
                height={10}
                width="20%"
                className={styles.title}
              />
            </div>
          </div>
        ) : (
          <div key={index} className={styles.rightMessage}>
            <div className={styles.message}>
              <Skeleton
                animation="wave"
                height={10}
                width="100%"
                className={styles.title}
              />
              <Skeleton
                animation="wave"
                height={10}
                width="80%"
                className={styles.title}
              />
              <Skeleton
                animation="wave"
                height={10}
                width="60%"
                className={styles.title}
              />
              <Skeleton
                animation="wave"
                height={10}
                width="20%"
                className={styles.title}
              />
            </div>
            <Skeleton
              animation="wave"
              variant="circle"
              width={40}
              height={40}
            />
          </div>
        ),
      )}
    </div>
  );
};

export default OfficeChatSkeleton;
