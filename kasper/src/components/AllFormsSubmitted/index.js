import React from 'react';
import Button from '@material-ui/core/Button';
import FormsCompletedCheckBox from 'assets/images/forms-completed-checkbox.svg';
import styles from './index.module.css';
import { useHistory } from 'react-router-dom';
import { useStores } from 'hooks/useStores';
import useResponsive from 'hooks/useResponsive';

const AllFormsSubmitted = () => {
  const { authentication } = useStores();
  const history = useHistory();
  const responsiveInfo = useResponsive();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={FormsCompletedCheckBox} alt="Success checkbox" />
        <span className={styles.successMessage}>
          All forms have been completed!
        </span>
        <span className={styles.instruction}>
          You can now close this window. We look forward to welcoming you to our
          office!
        </span>
        {!responsiveInfo.isDesktop && authentication.authenticatedData ? (
          <Button
            variant="outlined"
            color="secondary"
            size="medium"
            className={styles.okButton}
            onClick={() => history.replace('/lock-screen')}
            style={{ minWidth: 100 }}
          >
            Ok
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default AllFormsSubmitted;
