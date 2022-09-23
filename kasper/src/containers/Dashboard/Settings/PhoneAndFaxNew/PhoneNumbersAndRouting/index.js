import { Button } from '@material-ui/core';
import React from 'react';
import FaxNumbers from './FaxNumbers';
import styles from './index.module.css';
import VoiceNumbers from './VoiceNumbers';
import { useHistory, useRouteMatch } from 'react-router-dom';

const PhoneNumbersAndRouting = () => {
  const history = useHistory();
  const match = useRouteMatch(
    '/dashboard/settings/phone-and-fax/phone-number-and-routing',
  );

  return (
    <div className={styles.root}>
      <div className="d-flex justify-content-between align-items-center">
        <div className={styles.header}>Phone Numbers & Routing</div>
        {/*
        <Button
          type="submit"
          className="secondary-btn"
          variant="contained"
          color="secondary"
          onClick={() => history.push(`${match.url}/purchase-numbers`)}
        >
          Purchase Numbers
        </Button>
        */}
      </div>
      <div>
        <div className={styles.sectionContainer}>
          <VoiceNumbers />
        </div>
        <div className={styles.header}>Fax</div>
        <div className={styles.sectionContainer}>
          <FaxNumbers />
        </div>
      </div>
    </div>
  );
};

export default PhoneNumbersAndRouting;
