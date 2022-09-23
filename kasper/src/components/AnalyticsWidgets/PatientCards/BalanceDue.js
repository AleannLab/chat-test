import React, { useState } from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import BalanceDueScheduledPatients from 'components/AnalyticsDataTables/BalanceDueScheduledPatients';
import { convertToCurrency } from 'helpers/misc';

const BalanceDue = ({ data }) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        {!!data.moreData && data.moreData.length && (
          <span
            className={styles.actionButton}
            onClick={() => setShowMore(true)}
          >
            more
          </span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.title}>Balance Due for Scheduled Patients</div>
        <div>
          <span className={styles.mainText}>
            {convertToCurrency(data.totalProduction)}
          </span>
          <span
            className={styles.subText}
          >{` / ${data.totalPatients} patients`}</span>
        </div>
      </div>
      {showMore && (
        <Modal
          size="sm"
          onClose={() => setShowMore(false)}
          header="Balance Due for Scheduled Patients"
          body={<BalanceDueScheduledPatients data={data.moreData} />}
          footer={
            <Button
              className="primary-btn"
              variant="outlined"
              color="primary"
              onClick={() => setShowMore(false)}
            >
              Ok
            </Button>
          }
        />
      )}
    </div>
  );
};

export default BalanceDue;
