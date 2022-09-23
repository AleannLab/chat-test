import React, { useState } from 'react';
import styles from './index.module.css';
import { Grid, Typography } from '@material-ui/core';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react-lite';
import Swell from './IntegrationCards/Swell';
import ComingSoon from './IntegrationCards/ComingSoon';

const Integrations = observer(() => {
  return (
    <Grid container className={styles.root} wrap="nowrap">
      <Typography variant="h2" color="textPrimary">
        Integrations
      </Typography>
      <Typography variant="h4" color="textPrimary" className="my-4">
        Available Integrations
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Swell />
        </Grid>
        <Grid item xs={12} md={6}>
          <ComingSoon />
        </Grid>
      </Grid>
    </Grid>
  );
});

export default Integrations;
