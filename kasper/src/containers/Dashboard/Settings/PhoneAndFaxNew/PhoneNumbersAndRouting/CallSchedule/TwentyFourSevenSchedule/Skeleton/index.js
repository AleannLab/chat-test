import React from 'react';
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';

const ScheduleSkeleton = ({ isFull = false, negativeMargin = false }) => {
  return (
    <>
      <Grid
        container
        xs={isFull ? 12 : 6}
        style={{ marginLeft: negativeMargin ? '-420px' : '' }}
      >
        <Grid container className="mt-5">
          <Grid item xs={12} className="mt-0 mb-0 ps-2">
            <Skeleton
              variant="rect"
              animation="wave"
              width="100%"
              height={20}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ScheduleSkeleton;
