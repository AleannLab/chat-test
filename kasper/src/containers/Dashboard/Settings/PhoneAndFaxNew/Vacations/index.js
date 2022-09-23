import React from 'react';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { useHistory, useRouteMatch } from 'react-router-dom';
import VacationList from './VacationList';
import VacationHistory from './VacationHistory';
import styles from './index.module.css';

const Vacations = () => {
  const history = useHistory();
  const match = useRouteMatch('/dashboard/settings/phone-and-fax/vacations');

  return (
    <div className={styles.root}>
      <div className={styles.header}>Vacations</div>
      <div className={styles.info}>
        Set a custom vacation schedule that will override your inbound call
        schedule.
      </div>
      <div className="d-flex justify-content-end">
        <Button
          type="submit"
          className="secondary-btn"
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => history.push(`${match.url}/add-vacation`)}
        >
          Add Vacation
        </Button>
      </div>

      <div>
        <div className={styles.sectionContainer}>
          <VacationList />
        </div>
        <div className={styles.header}>Past Vacation History</div>
        <div className={styles.sectionContainer}>
          <VacationHistory />
        </div>
      </div>
    </div>
  );
};

export default Vacations;
