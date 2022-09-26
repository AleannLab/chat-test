import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import MaterialUIBadge from '@material-ui/core/Badge';

const useStyles = makeStyles({
  badge: {
    border: '1px solid #000',
    fontSize: '0.6rem',
    padding: '0.7rem',
    borderRadius: '1rem',
    background: (props) => props.color,
  },
});

const Badge = (props) => {
  const classes = useStyles(props);
  return <MaterialUIBadge {...props} classes={{ badge: classes.badge }} />;
};

export default Badge;
