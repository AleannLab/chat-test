import { Button, Typography } from '@material-ui/core';
import React from 'react';
import { ReactComponent as SuccessIcon } from 'assets/images/check-circle.svg';

const AddToQueueRenderer = ({
  sendSMS,
  sendEmail,
  handleAddToQueue,
  showSuccessLabel,
  isSubmitting,
}) => {
  return showSuccessLabel ? (
    <>
      <SuccessIcon width="1rem" height="1rem" />
      <Typography
        style={{
          display: 'inline',
          verticalAlign: 'middle',
          padding: '0.5rem',
        }}
      >
        Success
      </Typography>
    </>
  ) : (
    <Button
      className="secondary-btn"
      variant="contained"
      color="secondary"
      disabled={isSubmitting}
      onClick={handleAddToQueue}
    >
      {sendSMS || sendEmail ? 'Add & Notify' : 'Add'}
    </Button>
  );
};

export default AddToQueueRenderer;
