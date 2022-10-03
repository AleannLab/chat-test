import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';

const useStyles = makeStyles((theme) => ({
  root: {
    width: 46,
    height: 24,
    padding: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  switchBase: {
    padding: 1,
    height: '100%',
    '&$checked': {
      transform: 'translateX(22px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#F4266E',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#F4266E',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 21,
    // height: 21,
  },
  track: {
    borderRadius: 18,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: '#D2D2D2',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}));

const CustomSwitch = (props) => {
  const classes = useStyles();

  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
        disabled: classes.disabled,
      }}
      {...props}
    />
  );
};

export default CustomSwitch;
