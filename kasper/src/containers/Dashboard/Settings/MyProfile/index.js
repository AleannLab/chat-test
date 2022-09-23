import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import ProfileImage from './ProfileImage';
import PersonalData from './PersonalData';
import UpdatePassword from './UpdatePassword';

const MyProfile = () => {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.header}>My Profile</div>
        <Grid container className={styles.grid}>
          <Grid item xs={12} sm={3} md={3}>
            <ProfileImage />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <div>
              <PersonalData />
            </div>
            <div className="mt-5">
              <UpdatePassword />
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MyProfile;
