import React from 'react';
import styles from './index.module.css';
import AppBrandHeader from 'components/AppBrandHeader';
import PatientWithFromInfo from './PatientWithFormInfo';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router-dom';

export default function FamilyMenu() {
  const { phoneUID } = useParams();

  return (
    <div className={styles.root}>
      <AppBrandHeader />
      <div className={styles.menuContent}>
        <div>
          <Typography variant="h1" className="text-center my-4">
            Welcome to our practice!
          </Typography>
          <div className={styles.title}>
            There are multiple patients under this phone number, please select
            the family member for whom you wish to fill out forms.
          </div>
          <div className={styles.subTitle}>
            Your answers will be encrypted and sent securely to the office.
          </div>
        </div>
        <PatientWithFromInfo phoneUID={phoneUID} />
      </div>
    </div>
  );
}
