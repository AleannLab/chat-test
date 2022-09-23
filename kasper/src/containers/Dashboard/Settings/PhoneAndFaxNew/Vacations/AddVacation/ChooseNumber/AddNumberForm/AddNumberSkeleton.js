import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

import styles from './index.module.css';

const AddNumberSkeleton = ({ count = 2 }) => {
  return Array.apply(null, Array(count)).map((ele, index) => (
    <div className="d-flex flex-column" key={index}>
      <div className={styles.containerSkeleton}>
        <div className="d-flex w-100">
          <Skeleton variant="rect" animation="wave" height={20} width="5%" />
          <Skeleton
            variant="rect"
            animation="wave"
            height={20}
            width="60%"
            className="ms-2"
          />
        </div>
      </div>
    </div>
  ));
};

export default AddNumberSkeleton;
