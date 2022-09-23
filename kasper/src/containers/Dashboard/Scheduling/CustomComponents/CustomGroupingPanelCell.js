import React from 'react';
import styles from '../index.module.css';
import { GroupingPanel } from '@devexpress/dx-react-scheduler-material-ui';

const CustomGroupingPanelCell = ({ group, ...restProps }) => (
  <GroupingPanel.Cell
    group={group}
    {...restProps}
    className={styles.groupingPanel}
  ></GroupingPanel.Cell>
);

export default React.memo(CustomGroupingPanelCell);
