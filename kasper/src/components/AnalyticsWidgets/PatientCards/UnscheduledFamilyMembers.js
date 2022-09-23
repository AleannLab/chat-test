import React, { useState } from 'react';
import styles from './index.module.css';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import UnscheduledFamilyMembersTable from 'components/AnalyticsDataTables/UnscheduledFamilyMembers';

const UnscheduledFamilyMembers = ({ data }) => {
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
        <div className={styles.title}>Unscheduled Family Members</div>
        <div>
          <span className={styles.mainText}>{data.totalPatients}</span>
          <span className={styles.subText}> patients</span>
        </div>
      </div>
      {showMore && (
        <Modal
          size="sm"
          onClose={() => setShowMore(false)}
          header="Unscheduled Family Members"
          body={<UnscheduledFamilyMembersTable data={data.moreData} />}
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

export default UnscheduledFamilyMembers;
