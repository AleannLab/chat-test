import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { observer } from 'mobx-react';

import { useStores } from 'hooks/useStores';
import PaperlessFormSkeleton from '../PaperlessFormSkeleton';
import Menu from '../Menu';
import AddToGroup from 'components/PaperlessFormSections/AddToGroup';
import { ReactComponent as FolderTreeIcon } from 'assets/images/folder-tree.svg';
import { ReactComponent as ArchiveIcon } from 'assets/images/archive.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';

const archivedMenuItems = [
  { label: 'Add to Group', value: 'Add', icon: <FolderTreeIcon /> },
  {
    label: 'Unarchive',
    value: 'Unarchive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
];

const archivedNonAllSectionsMenuItems = [
  { label: 'Add to Group', value: 'Add', icon: <FolderTreeIcon /> },
  {
    label: 'Unarchive',
    value: 'Unarchive',
    icon: <ArchiveIcon style={{ fill: '#999999' }} />,
  },
  {
    label: 'Remove from Group',
    value: 'Remove',
    icon: <DeleteIcon style={{ fill: '#999999' }} />,
  },
];

const PaperlessFormSections = () => {
  const [formSections, setFormSections] = useState([]);
  const [showAddToGroup, setShowAddToGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { paperlessForm, formGroups, notification } = useStores(); // eslint-disable-line react-hooks/exhaustive-deps
  const [curGroup, setCurrentGroup] = useState();

  useEffect(() => {
    // Only reset the selections initially
    // Do not reset selected sections, after consent form as been added to selected sections
    if (paperlessForm.selectedSections.length === 0) {
      paperlessForm.resetSelectedSections();
      paperlessForm.setConsentForm();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (curGroup !== formGroups.selectedGroup.id) {
      setCurrentGroup(formGroups.selectedGroup.id);
      refreshSections();
    }
  }, [formGroups.selectedGroup]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => {
      refreshSections(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      paperlessForm.isSectionRemovedFromGroup,
      paperlessForm.isSectionUnarchived,
    ],
  );

  async function refreshSections(fetchAllForms = false) {
    // fetchAllForms is used to fetch all the forms after unarchiving or removing a section from the group
    setLoading(true);
    try {
      setFormSections([]);

      if (formGroups.selectedGroup.id !== 'all_sections') {
        if (fetchAllForms) {
          await paperlessForm.fetchList();
        }
        let sections = await _loadSectionsByGroup(formGroups.selectedGroup);
        setFormSections(sections);
      } else {
        await paperlessForm.fetchList();
        setFormSections(
          paperlessForm.getAllSectionsByArchiveStatus({ archived: true }),
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function _loadSectionsByGroup(group) {
    await paperlessForm.fetchSectionsOfSelectedGroup(group);
    return paperlessForm.sectionsByGroupId({
      groupId: group.id,
      archived: true,
    });
  }

  const handleMenuClick = async (e, formKey) => {
    if (e === 'Add') {
      paperlessForm.setSectionToGroupAdditionSuccessful(false);
      paperlessForm.setSectionToGroupAdditionUnsuccessful(false);
      paperlessForm.addSectionsToAddToGroups(formKey);
      setShowAddToGroup(true);
    } else if (e === 'Unarchive') {
      try {
        await paperlessForm.changeSectionArchiveStatus('unarchive', formKey);
        paperlessForm.setIsSectionUnarchived(formKey);
      } catch (err) {
        notification.showInfo(err.message);
      }
    } else if (e === 'Remove') {
      try {
        await paperlessForm.removeSectionFromGroup(
          formGroups.selectedGroup.id,
          formKey,
        );
        paperlessForm.setIsSectionRemovedFromGroup(formKey);
      } catch (err) {
        notification.showInfo(err.message);
      }
    }
  };

  return (
    <div className={styles.root}>
      <div>
        <div className={styles.headerContainer}>
          <div className={styles.headerText}>All Sections</div>
        </div>
        <div className={styles.subHeaderContainer}></div>
      </div>

      <div className={styles.sectionContainer}>
        <Scrollbars
          style={{ height: '100%' }}
          renderTrackHorizontal={(props) => <div {...props} />}
        >
          {loading === true && <PaperlessFormSkeleton count={5} />}
          {!loading && formSections?.length === 0 && (
            <span className={styles.empty}>Empty</span>
          )}
          {!loading &&
            formSections?.length > 0 &&
            formSections.map((form, i) => (
              <div key={i} className={styles.sectionArchived}>
                <div>{form.name}</div>
                <div className="ms-auto me-2">
                  {formGroups.selectedGroup.id === 'all_sections' ? (
                    <Menu
                      menuItems={archivedMenuItems}
                      onChangeValue={(e) => {
                        handleMenuClick(e, form.formKey);
                      }}
                    />
                  ) : (
                    <Menu
                      menuItems={archivedNonAllSectionsMenuItems}
                      onChangeValue={(e) => {
                        handleMenuClick(e, form.formKey);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          {showAddToGroup === true && (
            <AddToGroup onClose={() => setShowAddToGroup(false)} />
          )}
        </Scrollbars>
      </div>
    </div>
  );
};

export default observer(PaperlessFormSections);
