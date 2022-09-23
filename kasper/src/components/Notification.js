import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { useObserver } from 'mobx-react';
import Snackbar from '@material-ui/core/Snackbar';
import { useStores } from 'hooks/useStores';

export default function () {
  const { notification } = useStores();
  return useObserver(() => (
    <Snackbar
      anchorOrigin={notification.anchorOrigin}
      open={notification.visible}
      autoHideDuration={notification.autoHideDuration}
      onClose={() => notification.hideNotification()}
    >
      <Alert severity={notification.severity}>{notification.message}</Alert>
    </Snackbar>
  ));
}
