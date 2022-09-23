import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
  card: {
    border: '1px solid #D2D2D2',
    marginTop: '10px',
    width: '100%',
    padding: 4,
    display: 'flex',
    background: 'transparent',
    borderRadius: 3,
    boxShadow: 'none',
  },
}));

function Media(props) {
  const classes = useStyles();
  return (
    <Grid container className={classes.card}>
      <Grid item xs={1}>
        <Skeleton variant="rect" height="100%" width="20%" />
      </Grid>
      <Grid item xs={11}>
        <Skeleton height={20} width="40%" style={{ marginBottom: 10 }} />
        <Skeleton height={10} width="60%" style={{ marginBottom: 20 }} />
      </Grid>
    </Grid>
  );
}

export default function Loading() {
  return (
    <div>
      <Media loading />
      <Media />
    </div>
  );
}
