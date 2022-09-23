import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(1),
    background: 'transparent',
    boxShadow: 'none',
  },

  media: {
    height: 190,
  },
  text: {
    margin: '30px 15px 0px 15px',
    height: '10px',
    width: '150px',
  },
  checkbox: {
    margin: '20px 15px 0px 15px',
    height: '27px',
    width: '17px',
  },
  header: {
    margin: '30px 15px 0px 20px',
    height: '10px',
    width: '150px',
  },
}));

function LoadingScreen(props) {
  const classes = useStyles();

  return (
    <div>
      <Card className={classes.card}>
        <div style={{ display: 'flex' }}>
          <Skeleton variant="text" className={classes.checkbox} />
          <Skeleton variant="text" className={classes.header} />
          <Box ml={6.6}>
            {' '}
            <Skeleton variant="text" className={classes.text} />{' '}
          </Box>
          <Skeleton variant="text" className={classes.text} />
        </div>
        <Box mt={1}>
          {' '}
          <Skeleton animation="wave" variant="text" height={2} width="100%" />
        </Box>
      </Card>

      <Card className={classes.card}>
        <div style={{ display: 'flex' }}>
          <Skeleton variant="text" className={classes.checkbox} />
          <CardHeader
            avatar={
              <Skeleton
                animation="wave"
                variant="circle"
                width={40}
                height={40}
              />
            }
            title={
              <Skeleton
                animation="wave"
                variant="text"
                height={10}
                width={150}
                style={{ marginBottom: 6 }}
              />
            }
            subheader={
              <Skeleton
                animation="wave"
                variant="text"
                height={10}
                width={150}
              />
            }
          />
          <Skeleton variant="text" className={classes.text} />
          <Skeleton variant="text" className={classes.text} />
        </div>
        <Skeleton animation="wave" variant="text" height={1} width="100%" />
      </Card>
    </div>
  );
}

export default function Loading() {
  return (
    <div>
      <LoadingScreen loading />
    </div>
  );
}
