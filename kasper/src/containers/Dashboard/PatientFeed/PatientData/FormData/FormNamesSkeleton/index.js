import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

const FormGroupSkeleton = ({ count = 3 }) => {
  return (
    <div className="d-flex flex-column">
      {[...Array(count)].map((ele, index) => (
        <Skeleton
          key={index}
          variant="rect"
          width="100%"
          height={20}
          animation="wave"
          className="mb-4"
        />
      ))}
    </div>
  );
};

export default FormGroupSkeleton;
