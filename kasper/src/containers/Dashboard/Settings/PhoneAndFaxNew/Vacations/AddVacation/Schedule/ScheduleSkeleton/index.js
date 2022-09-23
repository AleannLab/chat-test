import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

const ScheduleSkeleton = () => {
  return (
    <div className="d-flex flex-column">
      <div className="d-flex justify-content-between mb-3 mt-3">
        <Skeleton variant="rect" animation="wave" height={25} width="10%" />
        <Skeleton variant="rect" animation="wave" height={25} width="50%" />
        <Skeleton variant="rect" animation="wave" height={25} width="10%" />
        <Skeleton variant="rect" animation="wave" height={25} width="10%" />
      </div>
    </div>
  );
};

export default ScheduleSkeleton;
