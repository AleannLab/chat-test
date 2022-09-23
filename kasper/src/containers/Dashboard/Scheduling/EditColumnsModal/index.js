import React, { useState } from 'react';
import styles from './index.module.css';
import { observer } from 'mobx-react-lite';
import { useStores } from 'hooks/useStores';
import { useMutation, useQueryClient } from 'react-query';
import { cloneDeep } from 'lodash';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from 'components/Core/Checkbox';

const EditColumnsModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { scheduling: schedulingStore, notification } = useStores();
  const [newColumnName, setNewColumnName] = useState('');
  const [appointmentColumns, setAppointmentColumns] = useState(
    cloneDeep(queryClient.getQueryData('operatories')),
  );

  const operatoriesMutation = useMutation((reqObj) =>
    schedulingStore.updateOperatory(reqObj),
  );

  const handleColumnSelect = (index, e) => {
    if (
      !e.target.checked &&
      appointmentColumns.filter(({ isHidden }) => !isHidden).length === 1
    ) {
      notification.showInfo('At least one column should be selected');
    } else {
      const copyAppointmentColumns = [...appointmentColumns];
      copyAppointmentColumns[index].isHidden = !e.target.checked;
      setAppointmentColumns([...copyAppointmentColumns]);
    }
  };

  const handleSaveClick = async () => {
    const reqObj = appointmentColumns.map(({ id, isHidden: is_hidden }) => ({
      id,
      is_hidden,
    }));
    await operatoriesMutation.mutateAsync(reqObj);
    queryClient.invalidateQueries('operatories');
    onClose();
  };

  return (
    <Modal
      size="sm"
      header="Edit Columns"
      body={
        <div>
          <div className={styles.formRoot}>
            <div className={`${styles.inputField} d-none`}>
              <InputBase
                className={styles.inputBox}
                placeholder="type column name here"
                onChange={(e) => setNewColumnName(e.target.value)}
              />
              <Button
                color="secondary"
                disableRipple
                disabled={!newColumnName.length}
                style={{ minWidth: 0, padding: 0 }}
              >
                add
              </Button>
            </div>
            <div className={styles.columnsContainer}>
              {appointmentColumns.map(({ id, text, isHidden }, index) => (
                <div key={id} className="d-flex justify-content-between">
                  <FormGroup className="flex-grow-1">
                    <FormControlLabel
                      value="end"
                      control={
                        <Checkbox
                          enableRipple={false}
                          checked={!isHidden}
                          onChange={(e) => handleColumnSelect(index, e)}
                        />
                      }
                      label={<span className={styles.columnLabel}>{text}</span>}
                      labelPlacement="end"
                      className="user-select-none mb-0"
                    />
                  </FormGroup>
                  <Button
                    color="default"
                    disableRipple
                    className={`${styles.deleteColumnBtn} d-none`}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-between mt-5">
            <Button
              className="primary-btn me-auto"
              variant="outlined"
              color="primary"
              onClick={onClose}
              disabled={operatoriesMutation.isLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="secondary-btn"
              variant="contained"
              color="secondary"
              onClick={handleSaveClick}
              disabled={operatoriesMutation.isLoading}
            >
              Save
            </Button>
          </div>
        </div>
      }
      onClose={onClose}
    />
  );
};

export default observer(EditColumnsModal);
