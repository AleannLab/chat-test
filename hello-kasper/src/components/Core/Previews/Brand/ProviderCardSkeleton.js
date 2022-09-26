import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Skeleton from '@material-ui/lab/Skeleton';
import { ReactComponent as UserProfile } from 'assets/images/user-profile.svg';
import PropTypes from 'prop-types';
import styles from './index.module.css';

const ProviderCardSkeleton = ({ index, disableAnimation }) => {
  const colors = ['#60C0F5', '#6D6AF6', '#82E980', '#AA77EA'];
  let headerColor = '';
  if (index < 4) {
    headerColor = colors[index];
  } else {
    headerColor = colors[index % 4];
  }

  return (
    <Card style={{ position: 'relative' }}>
      <CardMedia
        style={{
          height: '21px',
          background: headerColor,
        }}
      />
      <div className={styles.practitionerAvatar}>
        <UserProfile fill="#EDEDED" />
      </div>
      <CardContent style={{ padding: '16px 8px 8px 8px' }}>
        <div>
          <span>
            <Skeleton
              variant="text"
              animation={!disableAnimation ? 'wave' : false}
              height={5}
              style={{ margin: '0 auto' }}
            />
          </span>
          <span>
            <Skeleton
              variant="text"
              animation={!disableAnimation ? 'wave' : false}
              width="80%"
              height={4}
              style={{ margin: '0 auto' }}
            />
          </span>
        </div>
        <div className="mt-2">
          <span>
            <Skeleton
              variant="text"
              animation={!disableAnimation ? 'wave' : false}
              height={5}
              style={{ margin: '0 auto' }}
            />
          </span>
          <span>
            <Skeleton
              variant="text"
              animation={!disableAnimation ? 'wave' : false}
              width="80%"
              height={4}
              style={{ margin: '0 auto' }}
            />
          </span>
          <span>
            <Skeleton
              variant="text"
              animation={!disableAnimation ? 'wave' : false}
              width="80%"
              height={4}
              style={{ margin: '0 auto' }}
            />
          </span>
        </div>
        <div className={styles.addBtn}></div>
      </CardContent>
    </Card>
  );
};

ProviderCardSkeleton.propTypes = {
  index: PropTypes.number.isRequired,
  disableAnimation: PropTypes.bool,
};

ProviderCardSkeleton.defaultProps = {
  disableAnimation: false,
};

export default ProviderCardSkeleton;
