import React, { memo } from 'react';
import styles from './index.module.css';
import Tabs from 'components/Core/Tabs';
import Yesterday from './TabPages/Yesterday';
import Today from './TabPages/Today';
import Tomorrow from './TabPages/Tomorrow';

const TAB_CONFIG = [
  {
    index: 0,
    label: 'Yesterday',
    body: <Yesterday />,
  },
  {
    index: 1,
    label: 'Today',
    body: <Today />,
  },
  {
    index: 2,
    label: 'Tomorrow',
    body: <Tomorrow />,
  },
];

const TabView = () => {
  return (
    <Tabs
      className={styles.tabsContainer}
      config={TAB_CONFIG}
      defaultTabIndex={TAB_CONFIG[0].index}
    />
  );
};

export default memo(TabView);
