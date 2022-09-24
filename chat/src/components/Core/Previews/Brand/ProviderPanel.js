import { Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import ProviderCardSkeleton from './ProviderCardSkeleton';
import styles from './index.module.css';
import PropTypes from 'prop-types';

const ProviderPanel = React.memo(({ primaryColor, secondaryColor }) => (
  <Grid container spacing={2} className={styles.panel}>
    <Grid item xs={6}>
      <Skeleton
        variant="rect"
        height={4}
        animation={false}
        style={{ marginBottom: '3px' }}
      />
      <div className="d-flex">
        <Skeleton
          variant="rect"
          style={{
            border: `solid 0.5px ${primaryColor}`,
            backgroundColor: secondaryColor,
          }}
          width="50%"
          height={14}
          animation={false}
        />
        <Skeleton variant="rect" width="50%" height={14} animation={false} />
      </div>
      <Skeleton
        variant="rect"
        width="75%"
        height={4}
        animation={false}
        style={{ marginTop: '0.8rem' }}
      />
      <div className={styles.partialCard}>
        <span>
          <Skeleton
            variant="text"
            animation={false}
            width="80%"
            height={4}
            style={{ margin: '0 auto' }}
          />
        </span>
        <div className={styles.addBtn}></div>
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <ProviderCardSkeleton index={0} disableAnimation />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <ProviderCardSkeleton index={1} disableAnimation />
      </div>
    </Grid>
    <Grid item xs={6}>
      <Skeleton
        variant="rect"
        height={4}
        animation={false}
        style={{ marginBottom: '3px' }}
      />
      <Skeleton variant="rect" height={14} animation={false} />
      <Skeleton
        variant="rect"
        width="75%"
        height={2}
        animation={false}
        style={{ marginTop: '0.8rem', marginLeft: 'auto' }}
      />
      <div style={{ marginTop: '0.5rem' }}>
        <ProviderCardSkeleton index={2} disableAnimation />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <ProviderCardSkeleton index={3} disableAnimation />
      </div>
    </Grid>
  </Grid>
));

ProviderPanel.displayName = 'ProviderPanel';

ProviderPanel.propTypes = {
  primaryColor: PropTypes.string.isRequired,
  secondaryColor: PropTypes.string.isRequired,
};

export default ProviderPanel;
