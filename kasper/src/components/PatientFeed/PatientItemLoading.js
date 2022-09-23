import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
  card: {
    background: '#243656f0',
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
