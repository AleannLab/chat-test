import React from 'react';
import { Card, CardHeader, makeStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
  card: {
    background: '#ffffff',
    width: 'calc(100% + 8px)',
    margin: '-12px 0px 16px -7px',
    borderRadius: '0px',
  },
}));

function Media(props) {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardHeader
        avatar={
          <Skeleton animation="wave" variant="circle" width={40} height={40} />
        }
        title={
          <Skeleton
            animation="wave"
            variant="text"
            height={10}
            width="80%"
            style={{ marginBottom: 6 }}
          />
        }
        subheader={
          <Skeleton animation="wave" variant="text" height={10} width="80%" />
        }
      ></CardHeader>
    </Card>
  );
}

export default function Faceboo() {
  return (
    <div>
      <Media loading />
      <Media />
    </div>
  );
}
