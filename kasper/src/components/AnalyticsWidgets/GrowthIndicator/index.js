import React from 'react';
import styles from './index.module.css';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

const GrowthIndicator = ({ target, achieved, formatter = null }) => {
  const diff = Math.abs(target - achieved);
  const isPositive = achieved >= target;

  return (
    <div
      className={`${styles.root} ${
        isPositive ? styles.positive : styles.negative
      }`}
    >
      {isPositive ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      <span>
        {!!formatter && typeof formatter === 'function' && formatter(diff)}
      </span>
    </div>
  );
};

export default GrowthIndicator;
