import React, { useState } from 'react';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Avatar from 'components/Avatar';
import Checkbox from 'components/Core/Checkbox';
import { observer } from 'mobx-react';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';

import { useStores } from 'hooks/useStores';
import { useAuthToken } from 'hooks/useAuthToken';
import CustomTooltip from 'components/Core/Tooltip';
import Modal from 'components/Core/Modal';
import Table from 'components/Core/Table';
import styles from './index.module.css';

const tableColumns = [
  { id: 'selection', label: '', width: '10%' },
  { id: 'provider', label: 'Provider', width: '30%' },
  { id: 'position', label: 'Position', width: '30%' },
  { id: 'providerOperatory', label: 'Provider Operatory', width: '30%' },
];

const AddProviders = observer(
  ({
    onClose,
    handleEditProviders,
    providers,
    status,
    currentProviderIds,
    searchProvider,
    operatories,
  }) => {
    const [selectedProviders, setSelectedProviders] =
      useState(currentProviderIds);
    const [isSaving, setIsSaving] = useState(false);
    let tableRows = [];
    const authToken = useAuthToken();
    const { utils } = useStores();

    if (status === 'success') {
      tableRows = providers.map((provider) => {
        return createData(
          provider.id,
          provider.f_name,
          provider.l_name,
          provider.suffix,
          provider.display_image,
          provider.speciality,
          provider.operatory_id,
        );
      });
    }

    function createData(
      id,
      firstName,
      lastName,
      suffix,
      displayImage,
      speciality,
      operatoryId,
    ) {
      const selectionBox = (
        <div className="d-flex align-items-center flex-column">
          <Checkbox
            disabled={operatoryId === null}
            checked={selectedProviders.includes(id)}
            onClick={(event) => handleSelection(event, id)}
          />
        </div>
      );

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
          className={operatoryId === null ? styles.disabled : ''}
        />
      );
      const nameAvatar = (
        <div
          className={`${styles.avatarName} ${
            operatoryId === null ? styles.disabled : ''
          }`}
        >
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

      const position = (
        <span className={operatoryId === null ? styles.disabled : ''}>
          {speciality}
        </span>
      );

      let providerOperatory = '';
      if (operatoryId) {
        operatories.forEach((operatory) => {
          if (operatory.id === operatoryId) {
            providerOperatory = (
              <span className={operatoryId === null ? styles.disabled : ''}>
                {operatory.op_name}
              </span>
            );
          }
        });
      } else {
        providerOperatory = (
          <span className={operatoryId === null ? styles.disabled : ''}>
            No operatory set{' '}
            <CustomTooltip
              title={`No operatory set. Go to "Operatory Settings" to set an operatory for this provider.`}
              color="#000"
              placement="top-start"
              arrow
              maxWidth={256}
            >
              <HelpOutlineIcon
                style={{ fontSize: '1rem', marginLeft: '0.25rem' }}
                htmlColor="#9A9A9A"
              />
            </CustomTooltip>
          </span>
        );
      }

      return { id, selectionBox, nameAvatar, position, providerOperatory };
    }

    const handleSelection = (event, name) => {
      const selectedIndex = selectedProviders.indexOf(name);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedProviders, name);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedProviders.slice(1));
      } else if (selectedIndex === selectedProviders.length - 1) {
        newSelected = newSelected.concat(selectedProviders.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selectedProviders.slice(0, selectedIndex),
          selectedProviders.slice(selectedIndex + 1),
        );
      }

      setSelectedProviders(newSelected);
    };

    return (
      <Modal
        size="md"
        header="Providers"
        body={
          <div className={styles.container}>
            <p className={styles.subtitle}>
              You can add new provider to procedure group.
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
                selected={selectedProviders}
                columns={tableColumns}
                rows={tableRows}
                sortBy={tableColumns[0].id}
                enableSearchBar={false}
                isSelectable={false}
                height={450}
                isEmpty={tableRows.length === 0 && status === 'success'}
                disabled={isSaving}
                hideSelectionColor={true}
              />
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
                setIsSaving(true);
                handleEditProviders(selectedProviders);
              }}
              disabled={isSaving}
            >
              Save
            </Button>
          </>
        }
        onClose={onClose}
      />
    );
  },
);

export default AddProviders;
