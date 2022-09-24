import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Tab, Tabs, makeStyles } from '@material-ui/core';
import styles from './index.module.css';

const NotificationBlip = (props) => (
  <div {...props} className={styles.notificationBlip}></div>
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="flex-grow-1"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
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

const useTabStyles = makeStyles((theme) => {
  return {
    container: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
    },
    root: {
      height: 120,
      width: 20,
      minWidth: 50,
    },
    tabs: {
      borderRight: `1px solid #BBC1CD`,
      background: '#F0F3F8',
      '& .MuiTabs-indicator': {
        inset: '0',
        width: 3,
        backgroundColor: '#F4266E',
      },
    },
  };
});

const tabLabelStyles = {
  display: 'flex',
  alignItems: 'center',
  transform: 'rotate(-90deg)',
  color: '#02122F',
  fontSize: '14px',
  fontWeight: 500,
  justifyContent: 'center',
};

export default function VerticalTabs({
  className,
  panelClassName,
  config,
  defaultTabIndex,
  onChange,
  disabled,
}) {
  const tabClasses = useTabStyles();
  const [value, setValue] = React.useState(defaultTabIndex);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={tabClasses.container}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        className={tabClasses.tabs}
      >
        {config.map(
          ({ index, label, icon: Icon, notificationBlip, component }) => (
            <Tab
              disabled={disabled}
              key={index}
              id={`vertical-tab-${label.replaceAll(' ', '-')}`}
              label={
                <span style={tabLabelStyles}>
                  <>
                    {Icon && Icon}
                    <span style={{ marginLeft: Icon ? '0.5em' : 0 }}>
                      {label}
                    </span>
                  </>
                  {notificationBlip && <NotificationBlip />}
                </span>
              }
              className={className}
              classes={{ root: tabClasses.root }}
            />
          ),
        )}
      </Tabs>
      {config.map(({ component }, index) => (
        <TabPanel value={value} index={index} key={index}>
          {component}
        </TabPanel>
      ))}
    </div>
  );
}
