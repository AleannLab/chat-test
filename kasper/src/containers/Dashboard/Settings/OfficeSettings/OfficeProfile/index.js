import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import { observer } from 'mobx-react';
import OfficeData from './OfficeData';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const OfficeProfile = observer(() => {
  const { notification, officeProfile } = useStores();

  useEffect(() => {
    officeProfile
      .fetchData()
      .then(() => {
        officeProfile.loaded = true;
      })
      .catch(() => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the office information',
        );
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>Office Profile</div>
        <Grid container className={styles.grid}>
          <Grid item xs={12} sm={4} md={4}>
            <OfficeData />
          </Grid>
        </Grid>
      </div>
    </div>
  );
});

export default OfficeProfile;
