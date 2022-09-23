import React, { useState, useEffect } from 'react';
import Table from 'components/Core/Table';
import { observer } from 'mobx-react-lite';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from 'components/Core/Switch';
import Grid from '@material-ui/core/Grid';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';

const ControlledSwitch = ({ name, checked, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(!checked);
  };

  return <Switch name={name} checked={isChecked} onClick={handleChange} />;
};

const ControlledSelect = ({ selectedValue, actions, onChange }) => {
  const [value, setValue] = useState(selectedValue);

  const handleChange = (event) => {
    setValue(event.target.value);
    if (onChange) onChange(event.target.value);
  };

  return (
    <Select
      disabled={actions.length === 0}
      style={{ width: '100%', height: '36px' }}
      variant="outlined"
      id="action"
      value={value}
      onChange={handleChange}
    >
      {actions.map((ele) => (
        <MenuItem key={ele.id} value={ele.id}>
          {ele.name}
        </MenuItem>
      ))}
    </Select>
  );
};

const OfficeAutomation = observer(() => {
  const { trigger, notification } = useStores();
  const [isEmpty, setIsEmpty] = useState(false);
  const tableColumns = [
    { id: 'name', width: '30%', disablePadding: false, label: 'Trigger' },
    { id: 'action', width: '30%', disablePadding: false, label: 'Action' },
    { id: 'category', width: '20%', disablePadding: false, label: 'Category' },
    { id: 'enabled', width: '20%', disablePadding: false, label: 'Enabled' },
  ];

  useEffect(() => {
    trigger
      .fetchList()
      .then(() => {
        if (trigger.data.length === 0) {
          setIsEmpty(true);
        } else {
          trigger.data.forEach((ele) => {
            const triggerData = trigger.get([{}, ele]);
            if (triggerData.render_type === 'select') {
              if (triggerData.action_source === 'form_group') {
                trigger
                  .fetchFormActions({ actionSource: triggerData.action_source })
                  .catch((err) => {
                    console.error(err.message);
                    notification.showError(
                      'An unexpected error occurred while attempting to fetch the actions',
                    );
                  });
              }
            }
          });
          setIsEmpty(false);
        }
      })
      .catch((err) => {
        console.error(err);
        notification.showError(
          'An unexpected error occurred while attempting to fetch the triggers',
        );
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tableRows = trigger.data.map((ele) => {
    const triggerData = trigger.get([{}, ele]);
    return createData(
      triggerData.id,
      triggerData.label,
      triggerData.render_type,
      triggerData.description,
      triggerData.action_source,
      triggerData.current_action,
      triggerData.category,
      triggerData.enabled,
    );
  });

  function createData(
    triggerId,
    label,
    renderType,
    description,
    actionSource,
    currentAction,
    triggerCategory,
    isEnabled,
  ) {
    const id = triggerId;

    const triggerMenu = <span key={id}>{label}</span>;
    const actionData = trigger.actions.get(actionSource);

    let actions = [];
    if (renderType === 'select') {
      if (actionData !== undefined) {
        actions = [...actionData];
      }
    }

    const actionMenu =
      renderType === 'select' ? (
        <ControlledSelect
          selectedValue={currentAction}
          actions={actions}
          onChange={(value) => handleActionChange(triggerId, value)}
        />
      ) : (
        <span>{description}</span>
      );

    const category = <span>{triggerCategory}</span>;

    const enabled =
      renderType === 'select' &&
      !!actionData &&
      !actionData.find((d) => Number(d.id) === Number(currentAction)) ? (
        <i>Please select action</i>
      ) : (
        <ControlledSwitch
          name="enabled"
          checked={isEnabled === 1}
          onChange={(checked) => handleTriggerToggle(triggerId, checked)}
        />
      );

    return { id, triggerMenu, actionMenu, category, enabled };
  }

  const handleActionChange = async (triggerId, actionId) => {
    try {
      await trigger.updateTriggerAction({ actionId, triggerId });
      await trigger.fetchList();
    } catch (err) {
      notification.showError(
        'An unexpected error occurred while attempting to change the action',
      );
      await trigger.fetchList();
    }
  };

  const handleTriggerToggle = async (triggerId, enabled) => {
    try {
      await trigger.updateTriggerState({ triggerId, enabled });
      await trigger.fetchList();
    } catch (err) {
      notification.showError(err.message);
      await trigger.fetchList();
    }
  };

  return (
    <>
      <Grid className={styles.root}>
        <div className={styles.header}>Office Automation</div>
        <div className={styles.tableContainer}>
          <Table
            columns={tableColumns}
            rows={tableRows}
            sortBy={tableColumns[0].id}
            allowSelectAll={false}
            isSelectable={false}
            isEmpty={isEmpty}
          />
        </div>
      </Grid>
    </>
  );
});

export default OfficeAutomation;
