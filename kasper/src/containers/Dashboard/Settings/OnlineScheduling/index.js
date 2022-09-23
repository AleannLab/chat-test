import React, { useEffect, useRef, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Avatar from '@material-ui/core/Avatar';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import { observer } from 'mobx-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import debounce from 'lodash.debounce';
import LinearProgress from '@material-ui/core/LinearProgress';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import TextField from '@material-ui/core/TextField';

import { useAuthToken } from 'hooks/useAuthToken';
import { useStores } from 'hooks/useStores';
import { generateColor } from 'helpers/misc';
import Switch from 'components/Core/Switch';
import Table from 'components/Core/Table';
import OperatorySettings from './OperatorySettings';
import EmailNotifications from './EmailNotifications';
import AddAppointmentType from './AddAppointmentType';
import AddProviders from './AddProviders';
import Insurance from './Insurance';
import { ReactComponent as PencilIcon } from 'assets/images/custom-pencil.svg';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import styles from './index.module.css';

const ControlledSwitch = ({ name, checked, onChange, disabled }) => {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
    if (onChange) onChange(event.target.checked);
  };

  return (
    <Switch
      name={name}
      checked={isChecked}
      onClick={handleChange}
      disabled={disabled}
    />
  );
};

const tableColumns = [
  {
    id: 'procedure group',
    width: '24%',
    disablePadding: false,
    label: 'Procedure Group',
  },
  {
    id: 'display name',
    width: '24%',
    disablePadding: false,
    label: 'Display Name',
  },
  { id: 'time', width: '11%', disablePadding: false, label: 'Time' },
  { id: 'new patients', width: '11%', disablePadding: false, label: 'New Pts' },
  {
    id: 'returning patients',
    width: '12%',
    disablePadding: false,
    label: 'Returning Pts',
  },
  {
    id: 'providers',
    width: '12%',
    disablePadding: false,
    label: 'Providers',
    align: 'center',
  },
  { id: 'delete', width: '6%', disablePadding: false, label: '' },
];

const OnlineScheduling = observer(() => {
  const [showOperatorySettings, setShowOperatorySettings] = useState(false);
  const [showAddProviders, setShowAddProviders] = useState(false);
  const [showAddAppointmentType, setShowAddAppointmentType] = useState(false);
  const [operatories, setOperatories] = useState([]);
  const [currentProviderIds, setCurrentProviderIds] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [editingDisplayNameInfo, setEditingDisplayNameInfo] = useState({
    id: null,
    newDisplayName: null,
  });
  const [currentGroupNames, setCurrentGroupNames] = useState([]);
  const { onlineScheduleSettings, notification, utils } = useStores();
  const authToken = useAuthToken();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (queryClient.getQueryData('fetchConfiguration')) {
      setTableRows(
        queryClient.getQueryData('fetchConfiguration').map((config) => {
          return createData(
            config.id,
            config.name,
            config.display_name,
            config.time,
            config.new_patient,
            config.returning_patient,
            config.providers,
            false,
          );
        }),
      );
    }
  }, [editingDisplayNameInfo.id, editingDisplayNameInfo.newDisplayName]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Dropdown
   */
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const actionItems = [
    { id: 1, label: 'Add Appointments', value: 'add_appointments' },
    { id: 2, label: 'Edit Insurances', value: 'edit_insurances' },
    { id: 3, label: 'Copy Public Link', value: 'copy_public_link' },
  ];

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen); //NOSONAR
  };

  const handleClose = (e) => {
    if (anchorRef.current && anchorRef.current.contains(e.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleItemClick = (option) => {
    setOpen(false);
    if (option === 'add_appointments') {
      if (fetchAppointmentGroupsQuery.data.length > 1) {
        setShowAddAppointmentType(true);
      } else {
        notification.showInfo(
          'All the procedure groups from your PMS software are already added in the appointments!',
        );
      }
    } else if (option === 'edit_insurances') {
      onlineScheduleSettings.setShowEditInsurance(true);
    } else if (option === 'copy_public_link') {
      handleCopyLink();
    }
  };

  const fetchAppointmentGroupsQuery = useQuery(
    'fetchAppointmentGroups',
    () => onlineScheduleSettings.fetchAppointmentGroups(),
    {
      onSuccess: (data) => {
        data.unshift({
          id: 'select_disable',
          name: 'Select',
          value: 'select_disable',
        });
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const fetchOperatoriesQuery = useQuery(
    'fetchOperatories',
    () => onlineScheduleSettings.fetchOperatories(),
    {
      onSuccess: (data) => {
        setOperatories(data);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const fetchProvidersWithSearchQuery = useQuery(
    ['fetchProvidersWithSearch', onlineScheduleSettings.providerSearchVal],
    () => onlineScheduleSettings.fetchProviders(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const fetchConfigurationQuery = useQuery(
    'fetchConfiguration',
    () => onlineScheduleSettings.fetchConfiguration(),
    {
      enabled: fetchProvidersWithSearchQuery.status === 'success',
      onSuccess: (configData) => {
        setCurrentGroupNames(configData.map((config) => config.display_name));
        setTableRows(
          configData.map((config) => {
            return createData(
              config.id,
              config.name,
              config.display_name,
              config.time,
              config.new_patient,
              config.returning_patient,
              config.providers,
              false,
            );
          }),
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const [tableRows, setTableRows] = useState(
    queryClient.getQueryData('fetchConfiguration')
      ? queryClient.getQueryData('fetchConfiguration').map((config) => {
          return createData(
            config.id,
            config.name,
            config.display_name,
            config.time,
            config.new_patient,
            config.returning_patient,
            config.providers,
            false,
          );
        })
      : [],
  );

  const updateDisplayNameQuery = useMutation(
    'updateDisplayName',
    (procedureInfo) => onlineScheduleSettings.updateDisplayName(procedureInfo),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const updateAvailableForQuery = useMutation(
    'updateAvailableFor',
    (procedureInfo) => onlineScheduleSettings.updateAvailableFor(procedureInfo),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const deleteProcedureQuery = useMutation(
    'deleteProcedure',
    (procedureInfo) => onlineScheduleSettings.deleteProcedure(procedureInfo),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const updateProvidersQuery = useMutation(
    'updateProviders',
    (providerInfo) => onlineScheduleSettings.updateProviders(providerInfo),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  function createData(
    id,
    procGroup,
    dName,
    tInterval,
    newPatient,
    returningPatient,
    practitioners,
    disabled,
  ) {
    const procedureGroup = (
      <span className={styles.procedureGroup}>{procGroup}</span>
    );

    let displayName = '';
    if (editingDisplayNameInfo.id === id) {
      displayName = (
        <div className={styles.displayNameInputContainer}>
          <TextField
            value={editingDisplayNameInfo.newDisplayName}
            variant="outlined"
            onChange={(e) => {
              let editingDisplayNameInfoCopy = { ...editingDisplayNameInfo };
              editingDisplayNameInfoCopy.newDisplayName = e.target.value;
              setEditingDisplayNameInfo(editingDisplayNameInfoCopy);
            }}
            disabled={disabled}
          />{' '}
          <CheckIcon
            className="ms-1"
            style={{ color: '#9A9A9A', cursor: 'pointer' }}
            onClick={() => {
              if (!disabled) {
                handleEditDisplayName(id, dName, false, true);
              }
            }}
          />{' '}
          <ClearIcon
            className="ms-1"
            style={{ color: '#9A9A9A', cursor: 'pointer' }}
            onClick={() => {
              if (!disabled) {
                handleEditDisplayName(id, dName, false, false);
              }
            }}
          />
        </div>
      );
    } else {
      displayName = (
        <span className={styles.displayName}>
          {dName}{' '}
          <PencilIcon
            fill="#9A9A9A"
            onClick={() => {
              if (!disabled) {
                handleEditDisplayName(id, dName, true, false);
              }
            }}
            className={styles.pencilIcon}
          />
        </span>
      );
    }

    const timeInterval = (
      <span className={styles.timeInterval}>{tInterval}m</span>
    );

    const newPatients = (
      <ControlledSwitch
        disabled={disabled}
        name="newPatients"
        checked={newPatient}
        onChange={(newChecked) =>
          handleAvailableFor(id, newChecked, returningPatient)
        }
      />
    );

    const returningPatients = (
      <ControlledSwitch
        disabled={disabled}
        name="returningPatients"
        checked={returningPatient}
        onChange={(returningChecked) =>
          handleAvailableFor(id, newPatient, returningChecked)
        }
      />
    );

    let avatars = '';
    if (practitioners.length > 0) {
      avatars = (
        <AvatarGroup
          max={4}
          spacing="small"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setCurrentProviderIds(
              practitioners.map((practitioner) => practitioner.id),
            );
            setCurrentId(id);
            setShowAddProviders(true);
          }}
        >
          {practitioners.map((practitioner) => {
            let matchedPractitioner;
            if (queryClient.getQueryData(['fetchProvidersWithSearch', ''])) {
              queryClient
                .getQueryData(['fetchProvidersWithSearch', ''])
                .forEach((provider) => {
                  if (provider.id === practitioner.id) {
                    matchedPractitioner = provider;
                  }
                });
            }
            const practitionerImg = utils.prepareMediaUrl({
              uuid: matchedPractitioner.display_image,
              authToken,
            });
            if (practitionerImg) {
              return (
                <Avatar
                  src={practitionerImg}
                  style={{ backgroundColor: '#FFFFFF' }}
                />
              );
            } else {
              return (
                <Avatar
                  style={{
                    backgroundColor: generateColor(matchedPractitioner.id),
                  }}
                >
                  <span>
                    {!!matchedPractitioner.f_name &&
                    matchedPractitioner.f_name.length > 0
                      ? matchedPractitioner.f_name.charAt(0).toUpperCase()
                      : ''}
                    {!!matchedPractitioner.l_name &&
                    matchedPractitioner.l_name.length > 0
                      ? matchedPractitioner.l_name.charAt(0).toUpperCase()
                      : ''}
                  </span>
                </Avatar>
              );
            }
          })}
        </AvatarGroup>
      );
    } else {
      avatars = (
        <Fab
          size="small"
          style={{
            boxShadow: 'none',
            backgroundColor: '#FFFFFF',
            border: '1px solid #D2D2D2',
            cursor: 'pointer',
          }}
          onClick={() => {
            setCurrentId(id);
            setShowAddProviders(true);
          }}
        >
          <span className={styles.number}>
            <AddIcon />
          </span>
        </Fab>
      );
    }
    const deleteRecord = (
      <DeleteIcon
        className={disabled ? styles.disabled : styles.delete}
        onClick={() => {
          if (!disabled) {
            handleDeleteProcedure(id);
          }
        }}
      />
    );

    return {
      id,
      procedureGroup,
      displayName,
      timeInterval,
      newPatients,
      returningPatients,
      avatars,
      deleteRecord,
    };
  }

  const handleEditDisplayName = async (
    id,
    displayName,
    isEditing,
    shouldSave,
  ) => {
    if (isEditing) {
      let editingDisplayNameInfoCopy = {};
      editingDisplayNameInfoCopy.id = id;
      editingDisplayNameInfoCopy.newDisplayName = displayName;
      setEditingDisplayNameInfo(editingDisplayNameInfoCopy);
    } else if (!isEditing) {
      if (shouldSave) {
        const configurationData =
          queryClient.getQueryData('fetchConfiguration');
        if (
          !configurationData.find(
            (config) =>
              config.id !== id &&
              config.display_name.toLowerCase() ===
                editingDisplayNameInfo.newDisplayName.toLowerCase(),
          )
        ) {
          setTableRows([
            ...configurationData.map((config) => {
              return createData(
                config.id,
                config.name,
                config.display_name,
                config.time,
                config.new_patient,
                config.returning_patient,
                config.providers,
                true,
              );
            }),
          ]);
          await updateDisplayNameQuery.mutateAsync({
            appointmentTypeId: id,
            display_name: editingDisplayNameInfo.newDisplayName,
          });
          await queryClient.refetchQueries('fetchConfiguration').then(() => {
            setEditingDisplayNameInfo({
              id: null,
              newDisplayName: null,
            });
          });
        } else {
          notification.showError(
            'Display name already exists, please enter different display name.',
          );
        }
      } else {
        setEditingDisplayNameInfo({
          id: null,
          newDisplayName: null,
        });
      }
    }
  };

  const handleAvailableFor = async (id, newChecked, returningChecked) => {
    setTableRows(
      queryClient.getQueryData('fetchConfiguration').map((config) => {
        if (config.id === id) {
          return createData(
            config.id,
            config.name,
            config.display_name,
            config.time,
            newChecked,
            returningChecked,
            config.providers,
            true,
          );
        } else {
          return createData(
            config.id,
            config.name,
            config.display_name,
            config.time,
            config.new_patient,
            config.returning_patient,
            config.providers,
            true,
          );
        }
      }),
    );
    await updateAvailableForQuery.mutateAsync({
      appointmentTypeId: id,
      isNewPatient: newChecked,
      isReturningPatient: returningChecked,
    });
    await queryClient.refetchQueries('fetchConfiguration');
  };

  const handleDeleteProcedure = async (id) => {
    await deleteProcedureQuery.mutateAsync({ appointmentTypeId: id });
    await queryClient.refetchQueries('fetchConfiguration');
    queryClient.refetchQueries('fetchAppointmentGroups');
  };

  const handleEditProviders = async (ids) => {
    const providerInfo = { appointmentTypeId: currentId, providers: ids };
    await updateProvidersQuery.mutateAsync(providerInfo);
    await queryClient.refetchQueries('fetchConfiguration');
    setShowAddProviders(false);
    onlineScheduleSettings.setProviderSearchVal('');
    setCurrentProviderIds([]);
  };

  const searchProvider = debounce((searchVal) => {
    // queryClient.resetQueries(['fetchProvidersWithSearch', searchVal]);
    onlineScheduleSettings.setProviderSearchVal(searchVal);
    queryClient.refetchQueries(['fetchProvidersWithSearch', searchVal]);
  }, 500);

  const handleAddAppointmentType = async (display_name, id) => {
    const procedureInfo = { appointmentTypeId: id, display_name };
    await updateDisplayNameQuery.mutateAsync(procedureInfo);
    await queryClient.refetchQueries('fetchConfiguration');
    setShowAddAppointmentType(false);
    queryClient.refetchQueries('fetchAppointmentGroups');
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(window.location.host + '/schedule-appointment')
      .then(
        function () {
          notification.showSuccess('Link was copied successfully');
          setTimeout(() => {
            notification.hideNotification();
          }, 2000);
        },
        function () {
          notification.showError(
            'An unexpected error occurred while attempting to copy the link',
          );
        },
      );
  };

  return (
    <>
      {!onlineScheduleSettings.showEditInsurance ? (
        <Grid className={styles.root}>
          <div className={styles.header}>
            <div>
              <div className={styles.titles}>
                <div className={styles.headerTitle}>Online Scheduling</div>
                <div className={styles.info}>
                  Go to &quot;Action&quot; and click &quot;Add
                  Appointments&quot; to add procedure groups from your PMS
                  software. Patients will see these when trying to schedule
                  online.
                </div>
              </div>
              <EmailNotifications />
            </div>
            <div className={styles.headerButtons}>
              <div>
                <Button
                  className="me-3 secondary-btn"
                  variant="outlined"
                  color="secondary"
                  size="medium"
                  onClick={() => setShowOperatorySettings(true)}
                  disabled={fetchOperatoriesQuery.isFetching}
                >
                  Operatory Settings
                </Button>
              </div>
              <div className={styles.buttonColumn}>
                <Button
                  className="secondary-btn"
                  variant="contained"
                  color="secondary"
                  ref={anchorRef}
                  onClick={handleToggle}
                  aria-controls={open ? 'menu-list-grow' : undefined}
                  aria-haspopup="true"
                  endIcon={<ArrowDropDownIcon color="#FFFFFF" />}
                >
                  Action
                </Button>
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={undefined}
                  transition
                  disablePortal
                  placement="bottom"
                  className={styles.popper}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: 'center top' }}
                    >
                      <Paper elevation={4}>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            autoFocusItem={open}
                            id="menu-list-grow"
                            className="p-0"
                            onKeyDown={handleListKeyDown}
                          >
                            {actionItems.map((item) => (
                              <MenuItem
                                disabled={
                                  item.id === 1 &&
                                  fetchAppointmentGroupsQuery.status ===
                                    'loading'
                                }
                                key={item.id}
                                onClick={() => handleItemClick(item.value)}
                                className={styles.menuItem}
                              >
                                <span>{item.label}</span>
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </div>
            </div>
          </div>
          <div style={{ height: '5px' }}>
            {fetchConfigurationQuery.status === 'success' &&
              fetchConfigurationQuery.isFetching && (
                <LinearProgress className="mb-3" />
              )}
          </div>
          <div className={styles.tableContainer}>
            <Table
              isEmpty={
                tableRows.length === 0 &&
                fetchConfigurationQuery.status === 'success' &&
                !fetchConfigurationQuery.isFetching
              }
              columns={tableColumns}
              rows={tableRows}
              sortBy={tableColumns[0].id}
              allowSelectAll={false}
              isSelectable={false}
            />
          </div>
          {showOperatorySettings === true && (
            <OperatorySettings
              onClose={() => {
                onlineScheduleSettings.setProviderSearchVal('');
                setShowOperatorySettings(false);
              }}
              searchProvider={searchProvider}
              operatories={operatories}
            />
          )}
          {showAddProviders === true && (
            <AddProviders
              onClose={() => {
                onlineScheduleSettings.setProviderSearchVal('');
                setShowAddProviders(false);
              }}
              handleEditProviders={handleEditProviders}
              providers={fetchProvidersWithSearchQuery.data}
              status={fetchProvidersWithSearchQuery.status}
              currentProviderIds={currentProviderIds}
              searchProvider={searchProvider}
              operatories={operatories}
            />
          )}
          {showAddAppointmentType === true && (
            <AddAppointmentType
              onClose={() => setShowAddAppointmentType(false)}
              groups={fetchAppointmentGroupsQuery.data}
              currentGroupNames={currentGroupNames}
              handleAddAppointmentType={handleAddAppointmentType}
            />
          )}
        </Grid>
      ) : (
        <Insurance />
      )}
    </>
  );
});

export default OnlineScheduling;
