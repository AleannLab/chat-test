import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ButtonBase } from '@material-ui/core';
import Tooltip from 'components/Core/Tooltip';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #fff',
    borderRadius: '2rem',
    color: '#fff',
    height: '2.6rem',
    width: '2.6rem',
    fontWeight: 600,
  },
}));

const DialerRoundButton = ({
  icon = '',
  backgroundColor = null,
  borderColor = null,
  onClick = () => {},
  tooltip = '',
  tooltipOpen,
  disabled,
}) => {
  const classes = useStyles();

  return (
    <Tooltip
      placement="top"
      arrow={true}
      centerAlign={false}
      maxWidth={320}
      title={tooltip}
      open={tooltipOpen}
    >
      <ButtonBase
        disabled={disabled}
        className={classes.container}
        style={{
          background: backgroundColor,
          borderColor: borderColor ?? backgroundColor ?? '#fff',
        }}
        onClick={onClick}
      >
        {icon}
      </ButtonBase>
    </Tooltip>
  );
};

export default DialerRoundButton;
