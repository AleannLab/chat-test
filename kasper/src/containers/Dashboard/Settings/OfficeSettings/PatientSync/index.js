import React, { useEffect, useState, useMemo } from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { observer } from 'mobx-react-lite';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Switch from 'components/Core/Switch';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { useStores } from 'hooks/useStores';
import Table from 'components/Core/Table';
import styles from './index.module.css';
import { Typography } from '@material-ui/core';

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
        <MenuItem
          key={ele.id}
          value={ele.od_def_id}
          disabled={ele.od_def_id === '__select__' || ele.isSelected}
        >
          <span
            className={ele.od_def_id === '__select__' ? styles.disabled : ''}
          >
            {ele.name}
          </span>
        </MenuItem>
      ))}
    </Select>
  );
};

const tableColumns = [
  {
    id: 'patient_status',
    numeric: false,
    disablePadding: false,
    width: '50%',
    label: 'Patient Status in Kasper',
  },
  {
    id: 'status_od',
    numeric: false,
    disablePadding: false,
    width: '50%',
    label: 'Status in Open Dental',
  },
];

const additionalSettingsTableColumns = [
  {
    id: 'settings',
    numeric: false,
    disablePadding: false,
    width: '80%',
    label: 'Settings',
  },
  {
    id: 'enabled',
    numeric: false,
    disablePadding: false,
    width: '20%',
    label: 'Enabled',
  },
];

const PatientSync = observer(() => {
  const { lobby, notification, officeProfile } = useStores();
  const [definitions, setDefinitions] = useState([]);
  const [data, setData] = useState();
  const [tableRows, setTableRows] = useState([]);
  const [arrivedToReadySetting, setArrivedToReadySetting] = useState(false);
  const [checkoutSetting, setCheckoutSetting] = useState(false);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);
  const { patientBoardAdditionalSettings } = useFlags();

  const queryClient = useQueryClient();
  // eslint-disable-next-line no-unused-vars
  const fetchStatusDefinitionsQuery = useQuery(
    'fetchStatusDefinitions',
    () => lobby.fetchStatusDefinitions(),
    {
      onSuccess: (definitionData) => {
        definitionData.unshift({
          id: 0,
          name: "Don't Sync",
          value: '__dontsync__',
          od_def_id: '__dontsync__',
        });
        setDefinitions(definitionData);
      },
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the open dental options',
        );
      },
    },
  );

  // eslint-disable-next-line no-unused-vars
  const fetchMappedOptionsQuery = useQuery(
    'fetchMappedOptions',
    () => lobby.fetchMappedOptions(),
    {
      enabled: !!definitions.length,
      onSuccess: (response) => {
        // reset all the selected values
        definitions.forEach((def) => (def.isSelected = false));

        const mappedData = response.map(
          ({ id, status: label, state, od_def_id: value }) => {
            // Find the selected status in OD.
            const selectedDef = definitions.find(
              (def) =>
                def.od_def_id === value && def.od_def_id !== '__dontsync__',
            );
            if (selectedDef) selectedDef.isSelected = true;
            return {
              id,
              value: value || '__dontsync__',
              label,
              state,
            };
          },
        );

        setData(mappedData);

        setTableRows(
          mappedData.map((item) => {
            return createData(item.id, item.label, item.value, item.state);
          }),
        );
      },
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to fetch the statuses',
        );
      },
    },
  );

  const {
    data: patientBoardSettings,
    isFetching: isFetchingPatientBoardSettings,
  } = useQuery(
    'fetchAdditionalPatientBoardSettings',
    () => officeProfile.fetchPatientBoardSettings(),
    { enabled: patientBoardAdditionalSettings },
  );

  useEffect(() => {
    if (patientBoardSettings) {
      setArrivedToReadySetting(
        !!parseInt(
          patientBoardSettings.lobby_move_to_ready_on_no_pending_forms,
        ),
      );
      setCheckoutSetting(
        !!parseInt(
          patientBoardSettings.lobby_move_to_checkout_on_complete_in_od,
        ),
      );
    }
  }, [patientBoardSettings]);

  const updatePatientBoardSettings = useMutation(
    'updatePatientBoardSettings',
    (settings) => officeProfile.updatePatientBoardSettings(settings),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData('fetchAdditionalPatientBoardSettings', () => {
          setIsUpdatingSetting(false);
          const {
            lobby_move_to_ready_on_no_pending_forms,
            lobby_move_to_checkout_on_complete_in_od,
          } = variables;

          return {
            lobby_move_to_ready_on_no_pending_forms:
              lobby_move_to_ready_on_no_pending_forms ? '1' : '0',
            lobby_move_to_checkout_on_complete_in_od:
              lobby_move_to_checkout_on_complete_in_od ? '1' : '0',
          };
        });
      },
    },
  );

  const updateStatusQuery = useMutation(
    'updateStatus',
    (statusInfo) => lobby.updateStatus(statusInfo),

    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData('fetchMappedOptions', (oldData) => {
          const newData = [...oldData];

          const updatedKasperStatus = newData.find(
            ({ state }) => state === variables.state,
          );
          updatedKasperStatus.od_def_id = variables.odDefId;

          return newData;
        });
      },
      onError: () => {
        notification.showError(
          'An unexpected error occurred while attempting to update the status',
        );
      },
    },
  );

  const additionalSettingsTableRows = useMemo(
    () =>
      isFetchingPatientBoardSettings
        ? []
        : [
            {
              id: 1,
              setting:
                'Automatically move patients from Arrived to Ready if they have no pending forms',
              enabled: (
                <Switch
                  name="arrivedToReady"
                  checked={arrivedToReadySetting}
                  disabled={isUpdatingSetting}
                  onClick={(e) => {
                    setIsUpdatingSetting(true);
                    updatePatientBoardSettings.mutateAsync({
                      lobby_move_to_ready_on_no_pending_forms: e.target.checked,
                      lobby_move_to_checkout_on_complete_in_od: checkoutSetting,
                    });
                    setArrivedToReadySetting((o) => !o);
                  }}
                />
              ),
            },
            {
              id: 2,
              setting:
                'Move patients to Checkout status after they\'ve been "Set Complete" in Open Dental',
              enabled: (
                <Switch
                  name="checkout"
                  checked={checkoutSetting}
                  disabled={isUpdatingSetting}
                  onClick={(e) => {
                    setIsUpdatingSetting(true);
                    updatePatientBoardSettings.mutateAsync({
                      lobby_move_to_ready_on_no_pending_forms:
                        arrivedToReadySetting,
                      lobby_move_to_checkout_on_complete_in_od:
                        e.target.checked,
                    });
                    setCheckoutSetting((o) => !o);
                  }}
                />
              ),
            },
          ],
    [
      isFetchingPatientBoardSettings,
      arrivedToReadySetting,
      checkoutSetting,
      updatePatientBoardSettings,
      isUpdatingSetting,
    ],
  );

  const createData = (id, label, value, state) => {
    const patientStatus = <span>{label}</span>;
    const odStatus = (
      <ControlledSelect
        selectedValue={value}
        actions={definitions}
        onChange={(checked) => handleStatusChange(state, checked)}
      />
    );
    return { id, patientStatus, odStatus };
  };

  const handleStatusChange = async (state, odDefId) => {
    await updateStatusQuery.mutateAsync({ state, odDefId });
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>Patient Sync</div>
      <div className={styles.subHeader}>
        Patient status in open dental and Kasper will synchronize based on the
        below rules. Patient cards on the main dashboard will auto update to the
        appropriate column when status changes in Open Dental, and vice versa.
      </div>
      <div className={styles.tableContainer}>
        <div className={styles.statusTable}>
          <Table
            columns={tableColumns}
            rows={tableRows}
            sortBy={tableColumns[0].id}
            isSelectable={false}
          />
        </div>
        {patientBoardAdditionalSettings && (
          <div className={styles.additionalSettingsTable}>
            <Typography variant="h4" color="textPrimary" className="mb-4 mt-4">
              Additional Settings
            </Typography>
            <Table
              columns={additionalSettingsTableColumns}
              rows={additionalSettingsTableRows}
              isSelectable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default PatientSync;
