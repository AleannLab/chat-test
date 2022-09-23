import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { observer } from 'mobx-react';
import Skeleton from '@material-ui/lab/Skeleton';

import Checkbox from 'components/Core/Checkbox';
import { useStores } from 'hooks/useStores';
import Modal from 'components/Core/Modal';
import styles from './index.module.css';
import ListManager from 'components/ListManager';

const AddToGroup = ({ onClose }) => {
  const [isAdding, setisAdding] = useState(false);
  const [selectedFormGroups, setSelectedFormGroups] = useState([]);
  const { formGroups, paperlessForm, notification } = useStores();

  const handleGroupSelect = (id) => {
    const newSelectedFormGroups = [...selectedFormGroups];
    const index = newSelectedFormGroups.indexOf(id);
    if (index !== -1) {
      newSelectedFormGroups.splice(index, 1);
    } else {
      newSelectedFormGroups.push(id);
    }
    setSelectedFormGroups([...newSelectedFormGroups]);
  };

  const handleClose = () => {
    onClose();
  };

  const handleAddToGroup = async () => {
    if (selectedFormGroups.length === 0) {
      notification.showError('Select at least one group');
    } else {
      setisAdding(true);
      try {
        await Promise.all(
          paperlessForm.sectionsToAddToGroups.map(async (formKey) => {
            await Promise.all(
              selectedFormGroups.map(async (id) => {
                await paperlessForm.addSectionsToGroup(id, formKey);
              }),
            );
          }),
        );
        notification.showSuccess('Section(s) were added to the group(s)');
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 2500);
      } catch (e) {
        if (e.message.includes('already exists')) {
          notification.showError('Form already exists in this group');
        } else {
          notification.showError(
            'An unexpected error occurred while attempting to add section(s) to the group(s)',
          );
        }
        setTimeout(() => {
          notification.hideNotification();
          handleClose();
        }, 3000);
      }
    }
  };
  const groupsData = formGroups.listGroups({ showArchived: false });
  return (
    <Modal
      size="sm"
      fullWidth={false}
      header="Select Groups"
      allowClosing={!isAdding}
      body={
        <div className={styles.root}>
          <ListManager
            loading={formGroups.loading}
            loaded={formGroups.loaded}
            data={groupsData}
            selectedFormGroups={selectedFormGroups}
            render={React.memo(SmartGroupListItem)}
            handleGroupSelect={handleGroupSelect}
            isAdding={isAdding}
            renderLoading={<Skeleton />}
          />
        </div>
      }
      footer={
        <div className="d-flex w-100 justify-content-between mt-5">
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={handleClose}
            disabled={isAdding}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={handleAddToGroup}
            disabled={isAdding}
          >
            {isAdding ? 'Adding' : 'Add'}
          </Button>
        </div>
      }
      onClose={handleClose}
    />
  );
};

const SmartGroupListItem = observer(function ({
  id,
  payload: { handleGroupSelect, isAdding, selectedFormGroups },
  ...props
}) {
  const { formGroups } = useStores();
  const group = formGroups.datum[id] || {};
  return (
    <GroupListItem
      group={group}
      isAdding={isAdding}
      handleGroupSelect={handleGroupSelect}
      selectedFormGroups={selectedFormGroups}
    />
  );
});

const GroupListItem = ({
  group,
  handleGroupSelect,
  selectedFormGroups,
  isAdding,
}) => {
  return (
    <div key={group.id} className={styles.group}>
      <Checkbox
        disabled={isAdding}
        checked={selectedFormGroups.includes(group.id)}
        onClick={() => handleGroupSelect(group.id)}
      />
      <span className={styles.groupName}>{group.name}</span>
    </div>
  );
};

export default observer(AddToGroup);
