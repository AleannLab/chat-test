import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Badge from 'components/Core/Badge';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid #fff',
    borderRadius: '0.5rem',
    color: '#fff',
    width: '2rem',
    height: '2rem',
    cursor: 'pointer',
    fontWeight: 600,
    '&:active': {
      opacity: 0.5,
    },
    fontSize: '1rem',
  },
  customBadge: (props) => ({
    backgroundColor: props.badgeColor,
    color: '#fff',
  }),
}));

const DialerSquareButton = (props) => {
  const classes = useStyles(props);
  const {
    showBadge = false,
    badgeContent,
    badgeColor = 'red',
    title = '',
    backgroundColor = null,
    onLineClick = null,
  } = props;

  return (
    <div className={classes.root} onClick={onLineClick}>
      <Badge
        invisible={!showBadge}
        badgeContent={badgeContent}
        // color={badgeColor}
        classes={{ badge: classes.customBadge }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <div
          className={classes.container}
          style={{
            background: backgroundColor,
            borderColor: backgroundColor ? backgroundColor : '#fff',
          }}
        >
          <span>{title}</span>
        </div>
      </Badge>
    </div>
  );
};

export default DialerSquareButton;
