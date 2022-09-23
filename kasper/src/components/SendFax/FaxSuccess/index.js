import React from 'react';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';

import Modal from 'components/Core/Modal';
import UploadComplete from 'assets/images/audio-upload-complete.svg';
import styles from './index.module.css';
import PhoneNumber from 'awesome-phonenumber';

const FaxSuccess = ({ onClose, recipients }) => {
  const history = useHistory();

  const didList = recipients.map((recipient) => {
    const pn = new PhoneNumber(recipient.did);
    return pn.getNumber('national');
  });

  var recipientList = didList.join(', ');

  const handleClose = () => {
    history.goBack();
    onClose();
  };

  return (
    <Modal
      size="xs"
      body={
        <div className={styles.faxSent}>
          {recipients.length > 0 ? (
            <>
              <img
                src={UploadComplete}
                className={styles.checkBox}
                alt="Success checkbox"
              />
              <span>
                The fax was sent to:&nbsp;
                <span className={styles.recipient}>{recipientList}.</span>
              </span>
            </>
          ) : null}
        </div>
      }
      footer={
        <div className="d-flex justify-content-center w-100">
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            onClick={handleClose}
          >
            Ok
          </Button>
        </div>
      }
      onClose={handleClose}
    />
  );
};

export default FaxSuccess;
