import React from 'react';
import Grid from '@material-ui/core/Grid';
import { default as MiuSkeleton } from '@material-ui/lab/Skeleton';
import styles from './index.module.css';

const Skeleton = () => {
  return (
    <div>
      <MiuSkeleton variant="text" height={30} width="20%" />

      <Grid container className={`${styles.shortDetails} mb-3`}>
        <Grid item xs={12} md={10}>
          <MiuSkeleton variant="text" height={60} width="100%" />
        </Grid>
      </Grid>

      <Grid container spacing={3} className="mt-2">
        {/* First row */}
        <Grid container spacing={3} item>
          <Grid item xs={12} sm={6} md={4}>
            <MiuSkeleton variant="rect" height={150} width="100%" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MiuSkeleton variant="rect" height={150} width="100%" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MiuSkeleton variant="rect" height={150} width="100%" />
          </Grid>
        </Grid>

        {/* Second row */}
        <Grid container spacing={3} item>
          <Grid item xs={12} sm={8}>
            <MiuSkeleton variant="rect" height={150} width="100%" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MiuSkeleton variant="rect" height={150} width="100%" />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Skeleton;
