import { useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const KasperSlider = withStyles({
  thumb: {
    height: '20px !important',
    width: '20px !important',
    backgroundColor: '#fff',
    marginTop: '2px !important',
    '&:focus, &:hover, &$active': {
      boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
    },
    transition: '0.15s ease-out',
    '&.Mui-disabled': {
      backgroundColor: '#d2d2d2',
    },
  },
  active: {},
  track: {
    display: 'none',
  },
  rail: {
    height: 24,
    borderRadius: 12,
    padding: '0px 12px',
    marginLeft: '-8px',
    opacity: 1,
  },
})(Slider);

const SLIDER_VALUE = {
  OFF: 1,
  NA: 2,
  ON: 3,
};

const useStyles = makeStyles({
  root: {
    height: 24,
    width: 22,
    transition: '0.15s ease-out',
    color: (val) => {
      let color = '#D2D2D2';
      switch (val) {
        case 1:
          color = '#D2D2D2';
          break;
        case 2:
          color = '#FFC224';
          break;
        case 3:
          color = '#F4266E';
          break;
        default:
          break;
      }
      return color;
    },
  },
});

function TriStateSwitch({ value, disabled, onChange }) {
  const [selectedState, setSelectedState] = useState(SLIDER_VALUE['OFF']);
  const { root } = useStyles(selectedState);

  useEffect(() => {
    setSelectedState(SLIDER_VALUE[value] || SLIDER_VALUE.NA);
  }, [value]);

  const handleChange = (event, newValue) => {
    if (selectedState !== newValue) {
      setSelectedState(newValue);
      if (onChange && typeof onChange === 'function') {
        onChange(
          Object.keys(SLIDER_VALUE).find(
            (key) => SLIDER_VALUE[key] === newValue,
          ) || 'NA',
        );
      }
    }
  };

  return (
    <KasperSlider
      className={root}
      valueLabelDisplay="off"
      aria-label="tri state switch"
      step={1}
      min={1}
      max={3}
      defaultValue={selectedState}
      value={selectedState}
      onChangeCommitted={handleChange}
      disabled={disabled}
    />
  );
}

TriStateSwitch.propTypes = {
  value: PropTypes.oneOf(['ON', 'OFF']),
  disabled: PropTypes.bool,
};

TriStateSwitch.defaultProps = {
  value: 'ON',
  disabled: false,
};

export default TriStateSwitch;
