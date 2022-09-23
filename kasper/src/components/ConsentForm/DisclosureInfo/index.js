import React from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';

import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const DisclosureInfo = () => {
  const { paperlessForm, patientForm } = useStores();

  const handleClose = () => {
    paperlessForm.setOpenDisclosure(false);
    patientForm.setOpenDisclosure(false);
  };

  return (
    <Modal
      size="sm"
      header={
        <span className={styles.header}>
          Electronic Signatures and Records Disclosure
        </span>
      }
      body={
        <div className={styles.container}>
          <span className={styles.subtitle}>
            Please read the following information to receive notices and
            disclosures electronically.{' '}
          </span>
          <div className={styles.sections}>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Scope of Consent</span>
              <span className={styles.sectionContent}>
                You agree to receive electronic notices, disclosures, and
                electronic signature documents with all related and identified
                documents and disclosures provided over the course of your
                relationship with the “sending party.”
              </span>
            </div>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Paper Copies</span>
              <span className={styles.sectionContent}>
                You are not required to receive notices or disclosures or sign
                documents electronically and may request paper copies of
                documents or disclosures if you prefer to do so.
                <br />
                <br />
                If you wish to receive paper copies in lieu of electronic
                documents, you may close this web browser and request paper
                copies from the “sending party”
              </span>
            </div>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>Withdrawal of Consent</span>
              <span className={styles.sectionContent}>
                You have the right to withdraw at any time the consent to the
                use of electronic signatures and to have records provided in
                electronic form by notifying “sending party”. Your withdrawal of
                consent will not be effective until “sending party” receives it
                and has had a reasonable opportunity to act upon it.
              </span>
            </div>
          </div>
        </div>
      }
      footer={
        <Button
          className="primary-btn me-auto ms-auto mt-4"
          variant="outlined"
          color="primary"
          onClick={handleClose}
        >
          Close
        </Button>
      }
      onClose={handleClose}
    />
  );
};

export default DisclosureInfo;
