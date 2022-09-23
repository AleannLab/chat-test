import React from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const ActiveSession = () => {
  const history = useHistory();
  const { authentication } = useStores();

  const handleClose = () => {
    localStorage.openpages = Date.now();
    history.push('/');
  };

  const handleLogout = () => {
    authentication.logout();
    handleClose();
  };

  return (
    <Modal
      size="xs"
      body={
        <div className={styles.container}>
          <span className={styles.subtitle}>
            Kasper is open in another window. Click “Use Here” to use Kasper in
            this window.
          </span>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleLogout}
          >
            Log Out
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={handleClose}
          >
            Use Here
          </Button>
        </>
      }
      onClose={handleClose}
    />
  );
};

export default ActiveSession;
