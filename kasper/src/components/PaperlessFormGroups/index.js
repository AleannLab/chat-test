import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import { Scrollbars } from 'react-custom-scrollbars';
import IconButton from '@material-ui/core/IconButton';
// import LockIcon from "@material-ui/icons/Lock";
import { useHistory, useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react';

import FormGroupSkeleton from './FormGroupSkeleton';
import { useStores } from 'hooks/useStores';
import Menu from './Menu';
import SendFormsToPatients from 'components/SendFormsToPatients';
import { ReactComponent as BackIcon } from 'assets/images/back-arrow.svg';
import { ReactComponent as EditIcon } from 'assets/images/pencil.svg';
import { ReactComponent as ArchiveIcon } from 'assets/images/archive.svg';
import styles from './index.module.css';
import ListManager from 'components/ListManager';
import { LinearProgress } from '@material-ui/core';
import TabletViewLink from 'components/TabletViewLink';

const unarchivedMenuItems = [
  { label: 'Rename', itemLabel: 'Rename', value: 'Rename', icon: <EditIcon /> },
  {
    label: 'Archive',
    itemLabel: 'Archive',
    value: 'Archive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
];

const archivedMenuItems = [
  { label: 'Rename', itemLabel: 'Rename', value: 'Rename', icon: <EditIcon /> },
  {
    label: 'Unarchive',
    itemLabel: 'Unarchive',
    value: 'Unarchive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
];

const PaperlessFormGroups = observer(() => {
  const history = useHistory();
  const match = useRouteMatch('/dashboard/paperless-forms');
  const [showSendFormsToPatients, setShowSendFormsToPatients] = useState(false);
  const { formGroups, notification, paperlessForm } = useStores();

  useEffect(() => {
    formGroups.fetchList({});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => formGroups.setSelectedGroup(formGroups.ALL_SECTIONS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMenuClick = async (value, id, name) => {
    if (value === 'Archive') {
      try {
        const response = await formGroups.changeGroupArchiveStatus(id, true);
        if (response.success) {
          notification.showSuccess('Group was archived successfully');
          setTimeout(() => {
            notification.hideNotification();
          }, 2500);
        } else {
          notification.showInfo(response.error.DetailedMessage);
        }
      } catch (e) {
        notification.showError(
          'An unexpected error occurred while attempting to archive the group',
        );
      }
    }
    if (value === 'Unarchive') {
      try {
        await formGroups.changeGroupArchiveStatus(id, false);
        notification.showSuccess('Group was unarchived successfully');
        setTimeout(() => {
          notification.hideNotification();
        }, 2500);
      } catch (e) {
        notification.showError(
          'An unexpected error occurred while attempting to unarchive the group',
        );
      }
    }
    if (value === 'Rename') {
      history.push(`${match.url}/rename-group/${id}/${name}`);
    }
    if (value === 'Send') {
      paperlessForm.resetSelectedSections();
      paperlessForm.setConsentForm();
      try {
        const response = await paperlessForm.sendGroupToPatients(id);
        if (response.status !== 'Empty group') {
          setShowSendFormsToPatients(true);
        } else {
          notification.showError(
            'The current group does not contain any forms',
          );
        }
      } catch (e) {
        notification.showError(
          'An unexpected error occurred while attempting to send the group',
        );
      }
    }
  };

  const groupsData = formGroups.listGroups({
    showArchived: formGroups.showArchived,
  });
  return (
    formGroups.selectedGroup && (
      <div className={styles.root}>
        <div>
          <div className={styles.headerContainer}>
            <div className={`${styles.headerText} mb-3`}>Paperless Forms</div>
            <TabletViewLink />
          </div>
          <div className={styles.subHeaderContainer}>
            <div className={styles.subHeaderText}>
              {formGroups.showArchived ? 'Archived ' : ''}Groups (
              {groupsData.length})
            </div>
            <div>
              {formGroups.showArchived === false ? (
                <>
                  <IconButton
                    aria-label="archive"
                    onClick={() =>
                      formGroups.setShowArchived(!formGroups.showArchived)
                    }
                    size="medium"
                  >
                    <ArchiveIcon />
                  </IconButton>

                  <Button
                    color="secondary"
                    onClick={() => history.push(`${match.url}/add-new-group`)}
                  >
                    + Add New
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() =>
                    formGroups.setShowArchived(!formGroups.showArchived)
                  }
                  className={styles.backContainer}
                >
                  <BackIcon className={styles.backIcon} />
                  <span className={styles.backText}>Back</span>
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className={styles.groupContainer}>
          <Scrollbars
            style={{ height: '100%' }}
            renderTrackHorizontal={(props) => <div {...props} />}
          >
            {formGroups.loaded === true && formGroups.loading && (
              <LinearProgress />
            )}
            {formGroups.loaded && (
              <GroupListItem
                group={{
                  ...formGroups.ALL_SECTIONS,
                  archived: formGroups.showArchived ? 1 : 0,
                }}
                isSelected={formGroups.selectedGroup.id === 'all_sections'}
                onClick={() =>
                  formGroups.setSelectedGroup(formGroups.ALL_SECTIONS)
                }
                disabled={paperlessForm.loading}
              />
            )}
            <ListManager
              loading={formGroups.loading}
              loaded={formGroups.loaded}
              data={groupsData}
              handleMenuClick={handleMenuClick}
              render={React.memo(SmartGroupListItem)}
              renderLoading={<FormGroupSkeleton />}
            />
          </Scrollbars>
        </div>
        {showSendFormsToPatients === true && (
          <SendFormsToPatients
            onClose={() => setShowSendFormsToPatients(false)}
          />
        )}
      </div>
    )
  );
});

export default PaperlessFormGroups;

const SmartGroupListItem = observer(function ({
  id,
  payload: { handleMenuClick },
  ...props
}) {
  const { formGroups, paperlessForm } = useStores();
  const group = formGroups.datum[id] || {};
  const selectedGroup = formGroups.selectedGroup || {};
  return (
    <GroupListItem
      group={group}
      isSelected={selectedGroup.id === group.id}
      handleMenuClick={handleMenuClick}
      onClick={() => formGroups.setSelectedGroup(group)}
      disabled={paperlessForm.loading}
    />
  );
});

const GroupListItem = ({
  group,
  isSelected,
  onClick,
  handleMenuClick,
  disabled = false,
}) => {
  return (
    <div
      className={`${styles.group} ${isSelected ? styles.selectedGroup : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onClick={onClick}
      key={group.id}
    >
      {/* {group.locked && <LockIcon className={styles.lockIcon} />} */}
      <div>{group.name}</div>
      <div className="ms-auto">
        {group.archived === 0 ? (
          <>
            {group.id !== 'all_sections' && (
              <Menu
                menuItems={unarchivedMenuItems}
                onChangeValue={(e) => {
                  handleMenuClick(e, group.id, group.name);
                }}
              />
            )}
          </>
        ) : (
          <div className="d-flex flex-column ms-auto align-items-end">
            {group.id !== 'all_sections' && (
              <span className={styles.archiveText}>Archived</span>
            )}
            {group.id !== 'all_sections' && (
              <Menu
                menuItems={archivedMenuItems}
                onChangeValue={(e) => {
                  handleMenuClick(e, group.id, group.name);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
