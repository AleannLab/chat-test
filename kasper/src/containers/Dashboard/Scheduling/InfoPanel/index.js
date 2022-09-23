import styles from './index.module.css';
import PatientPanel from 'containers/Dashboard/PatientFeed/PatientPanel';

const InfoPanel = () => {
  return (
    <div className={styles.root}>
      <PatientPanel emptyMsg="Appointment not selected" />
    </div>
  );
};

export default InfoPanel;
