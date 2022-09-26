import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import { default as MuiTabs } from '@material-ui/core/Tabs';
import { default as MuiTab } from '@material-ui/core/Tab';
import TabPanel from './TabPanel';

const Tabs = ({
  className,
  panelClassName,
  config,
  defaultTabIndex,
  customStyle,
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(defaultTabIndex);
  }, [defaultTabIndex]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={`${styles.root} ${className}`}>
      <MuiTabs
        value={value}
        onChange={handleTabChange}
        className={`${styles.tabs} ${
          customStyle ? `${styles.customTabs} ${styles.px55}` : ''
        }`}
        TabIndicatorProps={{ className: styles.tabIndicator }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {config.map(({ index, label }) => (
          <MuiTab
            key={index}
            label={label}
            disableRipple
            className={`${styles.tab} ${
              customStyle ? `${styles.customTab} px-0` : ''
            }`}
          />
        ))}
      </MuiTabs>
      {config.map(({ index, body }) => (
        <TabPanel
          className={panelClassName}
          key={index}
          value={value}
          index={index}
        >
          {body}
        </TabPanel>
      ))}
    </div>
  );
};

Tabs.propTypes = {
  className: PropTypes.string,
  panelClassName: PropTypes.string,
  config: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      body: PropTypes.element,
    }),
  ).isRequired,
  defaultTabIndex: PropTypes.number,
};

Tabs.defaultProps = {
  className: '',
  panelClassName: '',
  config: [],
  defaultTabIndex: 0,
};

export default Tabs;
