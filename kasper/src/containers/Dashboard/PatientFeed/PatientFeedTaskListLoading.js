import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles(() => ({
  card: {
    marginLeft: '15px',
    width: '230px',
    background: 'transparent',
    boxShadow: 'none',
  },
  header: {
    padding: '8px',
  },
}));

function Media() {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardHeader
        className={classes.header}
        avatar={<Skeleton variant="rect" width={15} height={15} />}
        title={
          <Skeleton
            animation="wave"
            variant="text"
            height={10}
            width="80%"
            style={{ marginLeft: 5 }}
          />
        }
      />
    </Card>
  );
}

export default function Facebook() {
  return (
    <div>
      <Media loading />
      <Media />
    </div>
  );
}
