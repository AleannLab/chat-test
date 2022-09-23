import Grid from '@material-ui/core/Grid';
import Switch from 'components/Core/Switch';
import Table from 'components/Core/Table';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import styles from './index.module.css';
import AddReminder from 'components/AddReminder';
import Menu from './Menu';

const ControlledSwitch = ({ name, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(!checked);
  };

  return <Switch name={name} checked={isChecked} onClick={handleChange} />;
};

const tableColumns = [
  { id: 'name', width: '25%', disablePadding: false, label: 'Name' },
  {
    id: 'type',
    width: '25%',
    disablePadding: false,
    align: 'center',
    label: 'Type',
  },
  {
    id: 'enabled',
    width: '20%',
    disablePadding: false,
    align: 'center',
    label: 'Status',
  },
  {
    id: 'action',
    width: '10%',
    disablePadding: false,
    align: 'center',
    label: 'Action',
  },
];

const HygieneRemindersTable = observer(
  ({
    data,
    handleDelete,
    handleStatusChange,
    hygieneReminders,
    submitReminder,
  }) => {
    const [showAddReminder, setShowAddReminder] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingDuplicatingData, setEditingDuplicatingData] = useState({
      id: '',
      reminderName: '',
      dueDate: '',
      durationType: '',
      recallType: '',
      period: '',
      emailSubject: '',
      individualTemplatePreview: '',
      familyTemplatePreview: '',
      emailTemplatePreview: '',
      reminderType: '',
      customIndividualMessage: '',
    });

    let tableRows = data.map((reminder) => {
      return createData(
        reminder.id,
        reminder.name,
        reminder.pivotDate,
        reminder.channel,
        reminder.enabled,
      );
    });
    function createData(id, reminderName, dueDate, reminderType, enabled) {
      const name = (
        <div className={styles.nameContainer}>
          <span className={styles.name}>{reminderName}</span>
          {dueDate === 'before' ? (
            <span className={styles.durationType}>Before due date</span>
          ) : (
            <span className={styles.durationType}>After due date</span>
          )}
        </div>
      );
      let type = null;
      if (reminderType === 'EMAIL') {
        type = <span className={styles.type}>Email Only</span>;
      } else if (reminderType === 'SMS') {
        type = <span className={styles.type}>SMS Only</span>;
      } else if (reminderType === 'SMS_EMAIL') {
        type = <span className={styles.type}>SMS & Email</span>;
      }
      const isEnabled = (
        <ControlledSwitch
          name="newPatients"
          checked={enabled}
          onChange={() => {
            handleStatusChange(id, enabled);
          }}
        />
      );
      const action = (
        <Menu
          handleDelete={handleDelete}
          id={id}
          handleReminderEditing={(id) => {
            handleEditingAndDuplicating(id);
            setIsEditing(true);
            setShowAddReminder(true);
          }}
          handleDuplicate={(id) => {
            handleEditingAndDuplicating(id);
            setIsDuplicating(true);
            setShowAddReminder(true);
          }}
        />
      );

      return { id, name, type, isEnabled, action };
    }

    function handleEditingAndDuplicating(id) {
      const filteredReminder = data.find((reminder) => {
        return id === reminder.id;
      });
      const individualTemplatePreview =
        filteredReminder?.templates?.SMS?.individual;
      const familyTemplatePreview = filteredReminder?.templates?.SMS?.family;
      const emailTemplatePreview = filteredReminder?.templates?.EMAIL?.body;
      const reminderType = [];
      if (filteredReminder.channel === 'SMS_EMAIL') {
        reminderType.push('SMS');
        reminderType.push('EMAIL');
      } else if (filteredReminder.channel === 'SMS') {
        reminderType.push('SMS');
      } else if (filteredReminder.channel === 'EMAIL') {
        reminderType.push('EMAIL');
      }
      const idBasedOnAction = filteredReminder?.id;
      setEditingDuplicatingData({
        reminderName: filteredReminder.name || '',
        id: idBasedOnAction,
        dueDate: filteredReminder.pivotDate || '',
        durationType: filteredReminder.durationType || '',
        recallType: filteredReminder.recallTypeIds || [],
        period: filteredReminder.duration,
        emailSubject: filteredReminder?.templates?.EMAIL?.subject || '',
        customIndividualMessage: individualTemplatePreview || '',
        customFamilyMessage: familyTemplatePreview || '',
        customEmail: emailTemplatePreview || '',
        reminderType,
        templates: filteredReminder.templates,
        channel: filteredReminder.channel,
      });
    }

    return (
      <>
        <Grid className={styles.root}>
          <div className={styles.tableContainer}>
            <Table
              columns={tableColumns}
              rows={tableRows}
              sortBy={tableColumns[0].id}
              allowSelectAll={false}
              isSelectable={false}
              isEmpty={!hygieneReminders.loading && !data.length}
            />
          </div>
          {showAddReminder === true && (
            <AddReminder
              onClose={() => {
                setShowAddReminder(false);
                setIsEditing(false);
                setIsDuplicating(false);
              }}
              submitReminder={(payload) => {
                submitReminder(payload);
                setIsEditing(false);
                setIsDuplicating(false);
                setShowAddReminder(false);
              }}
              isEditing={isEditing}
              isDuplicating={isDuplicating}
              editingData={editingDuplicatingData}
            />
          )}
        </Grid>
      </>
    );
  },
);

export default HygieneRemindersTable;
