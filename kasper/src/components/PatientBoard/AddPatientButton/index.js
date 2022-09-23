import React from 'react';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styles from './index.module.css';

const AddPatientButton = () => {
  const history = useHistory();
  const match = useRouteMatch('/dashboard/office-task');

  return (
    <button
      className={styles.addPatient}
      onClick={() => history.push(`${match.url}/add-patient`)}
    >
      <AddIcon />
      <Typography style={{ fontWeight: '500' }}>Add Appointment</Typography>
    </button>
  );
};

export default AddPatientButton;
