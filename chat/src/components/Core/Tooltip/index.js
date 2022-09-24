import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = ({ maxWidth, minHeight, centerAlign, color, textColor }) =>
  makeStyles((theme) => ({
    tooltip: {
      background: `${color} !important`,
      fontSize: '0.91rem',
      maxWidth: maxWidth,
      opacity: 1,
      display: centerAlign ? 'flex' : '',
      alignItems: 'center',
      fontWeight: 'normal',
      minHeight: minHeight,
      maxHeight: '100%',
      color: textColor || theme.palette.common.white,
    },
    arrow: {
      color: `${color} !important`,
    },
  }));

const CustomTooltip = ({
  title,
  placement,
  arrow,
  centerAlign,
  maxWidth,
  minHeight,
  color,
  textColor,
  ...props
}) => {
  const classes = useStyles({
    maxWidth,
    minHeight,
    centerAlign,
    color,
    textColor,
  })();
  return (
    <Tooltip
      title={title}
      placement={placement}
      arrow={arrow}
      classes={{ tooltip: classes.tooltip, arrow: classes.arrow }}
      {...props}
      data-testid="tooltip-component"
    >
      {props.children}
    </Tooltip>
  );
};

CustomTooltip.propTypes = {
  title: PropTypes.string,
  placement: PropTypes.oneOf([
    'top-start',
    'top',
    'top-end',
    'right-start',
    'right',
    'right-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end',
  ]),
  arrow: PropTypes.bool,
  centerAlign: PropTypes.bool.isRequired,
  maxWidth: PropTypes.number,
  minHeight: PropTypes.number,
  color: PropTypes.string,
  textColor: PropTypes.string,
};

CustomTooltip.defaultProps = {
  title: '',
  placement: 'top',
  arrow: true,
  centerAlign: true,
  maxWidth: 150,
  minHeight: 35,
  color: '#566F9F',
  textColor: '',
};

export default CustomTooltip;
