import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import { ReactComponent as RightArrowIcon } from 'assets/images/double-arrow-right.svg';
import { ReactComponent as LeftArrowIcon } from 'assets/images/double-arrow-left.svg';
import { ReactComponent as GraphIcon } from 'assets/images/graph-trending-up.svg';
import TabView from 'components/AnalyticsWidgets/TabView';

const AnalyticsDrawer = ({ fullWidth }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(isDrawerOpen);
  }, [isDrawerOpen]);

  // Toggle drawer state
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className={styles.root}>
      <div className={styles.drawerToggler} onClick={toggleDrawer}>
        <div className={styles.drawerTogglerIcon}>
          <LeftArrowIcon />
        </div>
        <div className="d-flex flex-column align-items-center py-4">
          <GraphIcon />
          <div className={styles.textVertical}>Morning Huddle</div>
        </div>
      </div>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        PaperProps={{
          style: {
            position: 'absolute',
            width: fullWidth ? '100%' : 'auto',
            boxShadow: '-10px 1px 22px -8px rgba(0,0,0,0.32)',
          },
        }}
        BackdropProps={{ style: { position: 'absolute' } }}
        ModalProps={{
          container: document.getElementById('kasper-dashboard'),
          style: { position: 'absolute' },
        }}
        variant="persistent"
        className={styles.drawerWrapper}
      >
        <div className={styles.drawer}>
          <div className={styles.drawerToggler} onClick={toggleDrawer}>
            <div
              className={`${styles.drawerTogglerIcon} ${styles.drawerTogglerIconOpened}`}
            >
              <RightArrowIcon />
            </div>
            <div className="d-flex flex-column align-items-center py-4">
              <GraphIcon />
              <div className={styles.textVertical}>Morning Huddle</div>
            </div>
          </div>
          {isMounted && <TabView />}
        </div>
      </Drawer>
    </div>
  );
};

AnalyticsDrawer.propTypes = {
  fullWidth: PropTypes.bool,
};

AnalyticsDrawer.defaultProps = {
  fullWidth: true,
};

export default AnalyticsDrawer;
