import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Skeleton from '@material-ui/lab/Skeleton';

import styles from '../index.module.css';
import '../index.css';

const ProviderCardSkeleton = ({ index }) => {
  const colors = ['#60C0F5', '#6D6AF6', '#82E980', '#AA77EA'];
  let headerColor = '';
  if (index < 4) {
    headerColor = colors[index];
  } else {
    headerColor = colors[index % 4];
  }

  return (
    <div className="cst-card">
      <Card className={styles.disabledCard}>
        <CardMedia
          style={{
            height: '70px',
            background: headerColor,
          }}
        />
        <Skeleton
          variant="circle"
          animation="wave"
          className={styles.practitionerAvatar}
        />
        <CardContent className={styles.cardContent}>
          <div className={styles.practitionerDetails}>
            <span className={styles.practitionerName}>
              <Skeleton variant="text" animation="wave" height={25} />
            </span>
            <span className={styles.practitionerType}>
              <Skeleton
                variant="text"
                animation="wave"
                height={20}
                width={55}
                className="d-inline-flex"
              />
            </span>
          </div>
          <div className={styles.practitionerDescription}>
            <Skeleton
              variant="text"
              animation="wave"
              height={20}
              width={75}
              className="d-inline-flex"
            />
          </div>
          <Skeleton
            variant="text"
            animation="wave"
            height={30}
            width={50}
            className="d-inline-flex mt-4"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderCardSkeleton;
