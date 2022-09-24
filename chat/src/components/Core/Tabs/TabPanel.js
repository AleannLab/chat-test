import React from 'react';
import PropTypes from 'prop-types';
import styles from './index.module.css';
function TabPanel(props) {
  const { children, value, index, className, ...restProps } = props;

  return (
    <div
      hidden={value !== index}
      {...restProps}
      className={`${className} ${styles.tabPanel}`}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

export default TabPanel;
