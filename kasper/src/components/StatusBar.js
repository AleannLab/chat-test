import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import { ReactComponent as InfoIcon } from 'assets/images/info.svg';

const StatusBar = ({ onDismiss, message, actionText, ...props }) => {
  const classes = useStyles(props);
  return (
    <AppBar
      position="relative"
      classes={{ root: classes.root, colorPrimary: classes.colorPrimary }}
    >
      <div className={classes.content}>
        <InfoIcon fill="#fff" width="0.8rem" height="0.8rem" className="me-1" />
        <span>{message}</span>

        <span className={classes.actionItem} onClick={onDismiss}>
          {actionText}
        </span>
      </div>
    </AppBar>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    height: '2.5rem',
  },
  colorPrimary: (props) => ({
    backgroundColor: props.bgColor ?? '#566F9F',
  }),
  content: {
    fontFamily: 'Montserrat',
    fontSize: '11px',
    lineHeight: '13px',
    fontWeight: '400',
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    padding: '0 44px',
  },
  actionItem: {
    marginLeft: 'auto',
    fontWeight: '500',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
}));

export default StatusBar;
