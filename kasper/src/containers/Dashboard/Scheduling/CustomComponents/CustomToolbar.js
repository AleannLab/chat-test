import React, { useState, useEffect } from 'react';
import styles from '../index.module.css';
import { Toolbar } from '@devexpress/dx-react-scheduler-material-ui';
import Button from '@material-ui/core/Button';
import CustomAppointmentForm from './CustomAppointmentForm';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditColumnsModal from '../EditColumnsModal';
import { useStores } from 'hooks/useStores';
import { FEATURES } from 'helpers/constants';

const CustomToolBar = (props) => {
  const { scheduling: schedulingStore, notification } = useStores();
  const { Root } = Toolbar;
  const [openForm, setOpenForm] = useState(false);
  const [showEditColumnsModal, setShowEditColumnsModal] = useState(false);

  useEffect(() => {
    if (!schedulingStore.visibleOperatories.length) {
      setShowEditColumnsModal(true);
      notification.showInfo('At least one column should be selected');
    }
  }, [schedulingStore.visibleOperatories]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Root {...props}>
        {props.children}

        <Tooltip title="Edit Columns" arrow={true} placement="bottom">
          <IconButton
            className={styles.editColumnsButton}
            onClick={() => setShowEditColumnsModal(true)}
          >
            <ViewColumnIcon />
          </IconButton>
        </Tooltip>

        {FEATURES.SCHEDULE_APPOINTMENT && (
          <Button
            className="secondary-btn mr"
            variant="outlined"
            color="secondary"
            onClick={() => setOpenForm(true)}
          >
            Schedule Appointment
          </Button>
        )}

        <CustomAppointmentForm
          open={openForm}
          onClose={() => setOpenForm(false)}
        />

        {showEditColumnsModal ? (
          <EditColumnsModal onClose={() => setShowEditColumnsModal(false)} />
        ) : null}
      </Root>
    </>
  );
};

export default React.memo(CustomToolBar);
