import React from 'react';
import { DialogTitle, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import styles from './index.module.css';

const GroupSettingsModalHeader = ({ handleClose }) => {
  return (
    <DialogTitle disableTypography className="p-0">
      <div className="d-flex justify-content-end">
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <h2 className={styles.titleText}>Group Settings</h2>
    </DialogTitle>
  );
};

export { GroupSettingsModalHeader };
