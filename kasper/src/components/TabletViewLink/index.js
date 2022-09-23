import React from 'react';
import styles from './index.module.css';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { ReactComponent as CopyIcon } from 'assets/images/copy.svg';
import { ReactComponent as LinkIcon } from 'assets/images/link.svg';
import { ReactComponent as OpenInNewIcon } from 'assets/images/open-in-new.svg';
import { ReactComponent as QRCodeIcon } from 'assets/images/qr-code.svg';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
import Skeleton from '@material-ui/lab/Skeleton';
import copy from 'copy-to-clipboard';
import Modal from 'components/Core/Modal';
import QRCode from 'react-qr-code';
import { useState } from 'react';

const QRCodeModal = ({ onClose }) => {
  return (
    <Modal
      size="xs"
      header="Tablet View Link"
      body={
        <div
          className={`d-flex flex-column justify-content-center align-items-center pt-4 ${styles.qrCodeContainer}`}
        >
          <QRCode value={`${window.location.origin}/forms`} />
          <Button
            className="primary-btn"
            variant="outlined"
            color="primary"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
      onClose={onClose}
    />
  );
};

const TabletViewLink = () => {
  const { paperlessForm, notification } = useStores();

  const {
    isLoading,
    isSuccess,
    isError,
    data: tenantPin,
  } = useQuery('tenantPin', () => paperlessForm.getTenantPin(), {
    staleTime: Infinity,
  });

  const [showQRCode, setShowQRCode] = useState(false);

  const handleCopyPin = () => {
    copy(`${window.location.origin}/forms`, {
      onCopy: notification.showSuccess('Link copied to clipboard'),
    });
  };

  return (
    <Grid container className={styles.container}>
      <Grid item xs={6} className={styles.item}>
        <div className="p-3">
          <LinkIcon />
        </div>
        <div className={styles.details}>
          <div className={styles.title}>Tablet view link</div>
          <div className="d-flex align-items-center">
            <span className={styles.fieldLabel}>PIN&nbsp;:&nbsp;</span>
            <span className={styles.fieldValue}>
              {isLoading && <Skeleton variant="text" height={14} width={50} />}
              {isError && 'NA'}
              {isSuccess && tenantPin}
            </span>
          </div>
        </div>
      </Grid>
      <Grid item xs={2} className={styles.item}>
        <Button
          style={{ height: '100%' }}
          onClick={handleCopyPin}
          disabled={!tenantPin}
        >
          <CopyIcon className={styles.itemIcon} />
        </Button>
      </Grid>
      <Grid item xs={2} className={styles.item}>
        <Button
          style={{ height: '100%' }}
          disabled={!tenantPin}
          onClick={() => window.open('/forms', '_blank')}
        >
          <OpenInNewIcon className={styles.itemIcon} />
        </Button>
      </Grid>
      <Grid item xs={2} className={styles.item}>
        <Button
          style={{ height: '100%' }}
          disabled={!tenantPin}
          onClick={() => setShowQRCode(true)}
        >
          <QRCodeIcon className={styles.itemIcon} />
        </Button>
        {showQRCode && <QRCodeModal onClose={() => setShowQRCode(false)} />}
      </Grid>
    </Grid>
  );
};

export default TabletViewLink;
