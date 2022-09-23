import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const BorderLinearProgress = withStyles(() => ({
  root: {
    height: 8,
    borderRadius: 10,
  },
  colorPrimary: {
    backgroundColor: '#F0F3F8',
  },
  bar: {
    borderRadius: 10,
    background: 'linear-gradient(90deg, #432E88 15.28%, #F4266E 88.08%)',
  },
}))(LinearProgress);

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const ProgressBar = ({ value }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <BorderLinearProgress variant="determinate" value={value} />
    </div>
  );
};

export default ProgressBar;
