import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: 3,
    width: 16,
    height: 16,
    boxShadow: 'inset 0 0 0 2px #02122F, inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '$root.Mui-focusVisible &': {
      outline: '2px auto rgba(19,124,189,.6)',
      outlineOffset: 2,
    },
    'input:hover ~ &': {
      backgroundColor: '#FFE6EF',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#FFFFFF',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' " +
        "xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.75' y='0.75' width='14.5' height='14.5' rx='3.25' fill='white' stroke='%2302122F' " +
        "stroke-width='1.5'/%3E%3Cpath d='M6.38867 11.8429C6.58398 12.0524 6.91602 12.0524 7.11133 11.8429L12.8535 5.68586C13.0488 5.47644 13.0488 5.12042 12.8535 4.91099L12.1504 4.15707C11.9551 3.94764 11.6426 3.94764 11.4473 4.15707L6.75977 9.18325L4.55273 6.8377C4.35742 6.62827 4.04492 6.62827 3.84961 6.8377L3.14648 7.59162C2.95117 7.80105 2.95117 8.15707 3.14648 8.36649L6.38867 11.8429Z' fill='%23F4266E'/%3E%3C/svg%3E%0A\")",
      content: '""',
    },
  },
  indeterminateIcon: {
    backgroundColor: '#FFFFFF',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' " +
        "xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.75' y='0.75' width='14.5' height='14.5' rx='3.25' stroke='%2302122F' stroke-width='1.5'/%3E%3Crect x='4' y='7' width='8' height='2' rx='0.2' fill='%23F4266E'/%3E%3C/svg%3E%0A\")",

      content: '""',
    },
  },
});

const CustomCheckbox = ({
  checked,
  defaultDisabled,
  enableRipple,
  onClickFunc,
  indeterminate,
  ...props
}) => {
  const classes = useStyles();
  return (
    <Checkbox
      className={classes.root}
      onClick={onClickFunc}
      disabled={defaultDisabled}
      indeterminate={indeterminate}
      checked={checked}
      disableRipple={!enableRipple}
      indeterminateIcon={
        <span className={clsx(classes.icon, classes.indeterminateIcon)} />
      }
      checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
      icon={<span className={classes.icon} />}
      inputProps={{ 'aria-label': 'decorative checkbox' }}
      {...props}
    />
  );
};

CustomCheckbox.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  defaultDisabled: PropTypes.bool,
  enableRipple: PropTypes.bool,
  onClickFunc: PropTypes.func,
};

CustomCheckbox.defaultProps = {
  defaultDisabled: false,
  enableRipple: true,
};

export default CustomCheckbox;
