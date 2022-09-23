import React, { useEffect, useState } from 'react';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import { observer } from 'mobx-react';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import debounce from 'lodash.debounce';

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import { ReactComponent as PencilIcon } from 'assets/images/custom-pencil.svg';
import styles from './index.module.css';
import './index.css';
import SharedOperatory from './SharedOperatory';

const tableColumns = [
  { id: 'provider', label: 'Provider', width: '33%' },
  { id: 'position', label: 'Position', width: '33%' },
  { id: 'providerOperatory', label: 'Provider Operatory', width: '34%' },
];

const OperatorySettings = observer(({ onClose, operatories }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [editedProviders, setEditedProviders] = useState([]);
  const [editingProviderOperatoryInfo, setEditingProviderOperatoryInfo] =
    useState({ providerId: null, operatoryId: null, operatoryName: null });
  const [temporaryEditingData, setTemporaryEditingData] = useState({
    providerId: null,
    operatoryId: null,
    operatoryName: null,
    isNew: null,
  });

  const [showSharedOperatory, setShowSharedOperatory] = useState(false);
  const authToken = useAuthToken();
  const queryClient = useQueryClient();
  const { utils, onlineScheduleSettings, notification } = useStores();

  const fetchProvidersQuery = useQuery(
    ['fetchProvidersWithSearch', onlineScheduleSettings.providerSearchVal],
    () => onlineScheduleSettings.fetchProviders(),
    {
      onSuccess: (data) => {
        setTableRows(
          data.map((provider) => {
            return createData(
              provider.id,
              provider.f_name,
              provider.l_name,
              provider.suffix,
              provider.display_image,
              provider.speciality,
              provider.operatory_id,
            );
          }),
        );
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const updateOperatoryMappingQuery = useMutation(
    'updateOperatoryMapping',
    (data) => onlineScheduleSettings.updateOperatoryMapping(data),
    {
      onSuccess: () => {
        onClose();
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  const searchProvider = debounce((searchVal) => {
    // queryClient.resetQueries(['fetchProvidersWithSearch', searchVal]);
    onlineScheduleSettings.setProviderSearchVal(searchVal);
    queryClient.refetchQueries(['fetchProvidersWithSearch', searchVal]);
  }, 500);

  const [tableRows, setTableRows] = useState(
    queryClient.getQueryData(['fetchProvidersWithSearch', ''])
      ? queryClient
          .getQueryData(['fetchProvidersWithSearch', ''])
          .map((provider) => {
            return createData(
              provider.id,
              provider.f_name,
              provider.l_name,
              provider.suffix,
              provider.display_image,
              provider.speciality,
              provider.operatory_id,
            );
          })
      : [],
  );

  function createData(
    id,
    firstName,
    lastName,
    suffix,
    displayImage,
    speciality,
    operatoryId,
    disabled,
  ) {
    const provider = utils.prepareMediaUrl({
      uuid: displayImage,
      authToken,
    });

    const providerAvatar = (
      <Avatar
        src={provider}
        id={id}
        firstName={firstName}
        lastName={lastName}
      />
    );
    const nameAvatar = (
      <div className={styles.avatarName}>
        {providerAvatar}
        <div className={styles.info}>
          <span>
            <>
              {firstName} {lastName}
              {suffix ? `, ${suffix}` : ``}
            </>
          </span>
        </div>
      </div>
    );

    const position = <span>{speciality}</span>;

    let providerOperatory = '';
    if (operatoryId !== null && !isProviderEdited(id)) {
      operatories.forEach((operatory) => {
        if (operatory.id === operatoryId) {
          providerOperatory = (
            <span>
              {operatory.op_name}{' '}
              <PencilIcon
                fill="#9A9A9A"
                onClick={() => {
                  if (!disabled) {
                    handleEditProvider(id, operatoryId);
                  }
                }}
                className={styles.pencilIcon}
              />
            </span>
          );
        }
      });
    } else if (
      (operatoryId !== null && isProviderEdited(id)) ||
      isProviderEdited(id)
    ) {
      providerOperatory = (
        <Select
          value={getEditedOperatoryId(id).operatoryId}
          className={operatoryId === '' ? 'cst-grey-select' : ''}
          variant="outlined"
          displayEmpty
          onChange={(e) => handleOperatoryChange(id, e.target.value, false)}
          disabled={disabled}
        >
          <MenuItem value="" disabled>
            Select Operatory
          </MenuItem>
          {operatories.map((operatory) => (
            <MenuItem key={operatory.id} value={operatory.id}>
              {operatory.op_name}
            </MenuItem>
          ))}
        </Select>
      );
    } else {
      providerOperatory = (
        <Select
          className="cst-grey-select"
          value=""
          variant="outlined"
          displayEmpty
          onChange={(e) => handleOperatoryChange(id, e.target.value, true)}
          disabled={disabled}
        >
          <MenuItem value="" disabled>
            Select Operatory
          </MenuItem>
          {operatories.map((operatory) => (
            <MenuItem key={operatory.id} value={operatory.id}>
              {operatory.op_name}
            </MenuItem>
          ))}
        </Select>
      );
    }
    return { id, nameAvatar, position, providerOperatory };
  }

  function handleEditProvider(providerId, operatoryId) {
    let operatoryName = '';
    operatories.forEach((operatory) => {
      if (operatory.id === operatoryId) {
        operatoryName = operatory.op_name;
      }
    });
    let editedProvidersCopy = [...editedProviders];
    if (editedProvidersCopy.length > 0) {
      let flag = 0;
      editedProvidersCopy.forEach((provider) => {
        if (provider.providerId === providerId) {
          flag = 1;
          provider.operatoryName = operatoryName;
          provider.operatoryId = operatoryId;
        }
      });
      /**
       * If the provider does not exist in the array. Add the new edited provider
       */
      if (!flag) {
        editedProvidersCopy.push({
          providerId,
          operatoryId,
          operatoryName,
        });
      }
    } else {
      editedProvidersCopy.push({
        providerId,
        operatoryId,
        operatoryName,
      });
    }
    setEditedProviders(editedProvidersCopy);
    setEditingProviderOperatoryInfo({
      providerId,
      operatoryId,
      operatoryName,
    });
  }

  useEffect(() => {
    if (queryClient.getQueryData(['fetchProvidersWithSearch', ''])) {
      setTableRows(
        queryClient
          .getQueryData(['fetchProvidersWithSearch', ''])
          .map((provider) => {
            if (provider.id === editingProviderOperatoryInfo.providerId) {
              return createData(
                provider.id,
                provider.f_name,
                provider.l_name,
                provider.suffix,
                provider.display_image,
                provider.speciality,
                editingProviderOperatoryInfo.operatoryId,
                isSaving,
              );
            } else {
              return createData(
                provider.id,
                provider.f_name,
                provider.l_name,
                provider.suffix,
                provider.display_image,
                provider.speciality,
                provider.operatory_id,
                isSaving,
              );
            }
          }),
      );
    }
  }, [editedProviders, isSaving]); // eslint-disable-line react-hooks/exhaustive-deps

  function isProviderEdited(providerId) {
    return editedProviders.find(
      (provider) => provider.providerId === providerId,
    );
  }

  function getEditedOperatoryId(id) {
    return editedProviders.find((provider) => {
      if (provider.providerId === id) {
        return provider;
      }
    });
  }

  function handleOperatoryChange(providerId, operatoryId, isNew) {
    let operatoryName = '';
    operatories.forEach((operatory) => {
      if (operatory.id === operatoryId) {
        operatoryName = operatory.op_name;
      }
    });
    let flag = 0;
    /**
     * Check same operatory within edited providers
     */
    editedProviders.forEach((provider) => {
      if (provider.providerId !== providerId) {
        if (provider.operatoryId === operatoryId) {
          flag = 1;
          setTemporaryEditingData({
            providerId,
            operatoryId,
            operatoryName,
            isNew,
          });
          setShowSharedOperatory(true);
        }
      }
    });
    /**
     * Check same operatory in providers which are not edited
     */
    let editedProviderIds = editedProviders.map(
      (editedProvider) => editedProvider.providerId,
    );
    queryClient
      .getQueryData(['fetchProvidersWithSearch', ''])
      .forEach((provider) => {
        if (
          provider.id !== providerId &&
          !editedProviderIds.includes(provider.id)
        ) {
          if (provider.operatory_id === operatoryId) {
            flag = 1;
            setTemporaryEditingData({
              providerId,
              operatoryId,
              operatoryName,
              isNew,
            });
            setShowSharedOperatory(true);
          }
        }
      });
    if (!flag) {
      let editedProvidersCopy = [...editedProviders];
      editedProviders.forEach((provider) => {
        if (provider.providerId === providerId) {
          provider.operatoryId = operatoryId;
          provider.operatoryName = operatoryName;
        }
      });
      setEditedProviders(editedProvidersCopy);
      setEditingProviderOperatoryInfo({
        providerId,
        operatoryId,
        operatoryName,
      });
    }
    if (isNew) {
      let editedProvidersCopy = [...editedProviders];
      let isPresent = false;
      editedProviders.forEach((provider) => {
        if (provider.providerId === providerId) {
          isPresent = true;
          provider.operatoryId = operatoryId;
          provider.operatoryName = operatoryName;
        }
      });
      if (!isPresent) {
        editedProvidersCopy.push({ providerId, operatoryId, operatoryName });
      }
      setEditedProviders(editedProvidersCopy);
      setEditingProviderOperatoryInfo({
        providerId,
        operatoryId,
        operatoryName,
      });
    }
  }

  const handleSharedOperatory = (shouldContinue) => {
    if (shouldContinue) {
      let editedProvidersCopy = [...editedProviders];
      editedProviders.forEach((provider) => {
        if (provider.providerId === temporaryEditingData.providerId) {
          provider.operatoryId = temporaryEditingData.operatoryId;
          provider.operatoryName = temporaryEditingData.operatoryName;
        }
      });
      setEditedProviders(editedProvidersCopy);
      setEditingProviderOperatoryInfo({
        providerId: temporaryEditingData.providerId,
        operatoryId: temporaryEditingData.operatoryId,
        operatoryName: temporaryEditingData.operatoryName,
      });
    } else {
      /**
       * When a new operatory is being set and if the user presses cancel if it clashes with other operatories
       * set the operatory id to empty string to show greyed out 'Select Operatory' text
       */
      if (temporaryEditingData.isNew) {
        let editedProvidersCopy = [...editedProviders];
        editedProviders.forEach((provider) => {
          if (provider.providerId === temporaryEditingData.providerId) {
            provider.operatoryId = '';
            provider.operatoryName = temporaryEditingData.operatoryName;
          }
        });
        setEditedProviders(editedProvidersCopy);
        setEditingProviderOperatoryInfo({
          providerId: temporaryEditingData.providerId,
          operatoryId: '',
          operatoryName: temporaryEditingData.operatoryName,
        });
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateOperatoryMappingQuery.mutateAsync(
      editedProviders.map(({ providerId, operatoryId }) => ({
        id: providerId,
        operatoryId,
      })),
    );
    await queryClient.refetchQueries(['fetchProvidersWithSearch', '']);
  };

  return (
    <Modal
      size="md"
      header="Operatory Settings"
      body={
        <div className={styles.container}>
          <p className={styles.subtitle}>
            Operatory settings below will be used to determine online scheduling
            availability, and will determine where appointments for that
            provider are scheduled.
          </p>
          <div className={styles.searchBar}>
            <SearchIcon className="me-1" />
            <InputBase
              className={styles.inputBox}
              placeholder="Search..."
              onChange={(e) => searchProvider(e.target.value)}
              disabled={isSaving}
            />
          </div>
          <div className={styles.table}>
            <Table
              columns={tableColumns}
              rows={tableRows}
              sortBy={tableColumns[0].id}
              enableSearchBar={false}
              isSelectable={false}
              height={450}
              isEmpty={
                tableRows.length === 0 &&
                fetchProvidersQuery.status === 'success'
              }
              disabled={isSaving}
              hideSelectionColor={true}
            />
            {showSharedOperatory === true && (
              <SharedOperatory
                onClose={() => setShowSharedOperatory(false)}
                handleSharedOperatory={handleSharedOperatory}
              />
            )}
          </div>
        </div>
      }
      footer={
        <>
          <Button
            className="primary-btn me-auto"
            variant="outlined"
            color="primary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            className="secondary-btn"
            variant="contained"
            color="secondary"
            onClick={() => {
              handleSave();
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving' : 'Save'}
          </Button>
        </>
      }
      onClose={onClose}
    />
  );
});

export default OperatorySettings;
