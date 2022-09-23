import React, { useState } from 'react';
import styles from './index.module.css';
import { useStores } from 'hooks/useStores';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Grid, MenuItem, Select, LinearProgress } from '@material-ui/core';
import Table from 'components/Core/Table';
import Skeleton from '@material-ui/lab/Skeleton';

// Component to control select field
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
        <MenuItem key={ele.id} value={ele.od_def_id}>
          {ele.name}
        </MenuItem>
      ))}
    </Select>
  );
};

const tableColumns = [
  {
    id: 'forms',
    numeric: false,
    disablePadding: false,
    width: '50%',
    label: 'Forms',
  },
  {
    id: 'folder_in_od',
    numeric: false,
    disablePadding: false,
    width: '50%',
    label: 'Upload to Folder in Open Dental',
  },
];

export default function PatientFolderMapping() {
  const { paperlessForm, notification } = useStores();
  const queryClient = useQueryClient();

  // React query to fetch paperless forms config
  const foldersForMappingQuery = useQuery(
    ['foldersForMapping'],
    () => paperlessForm.getFoldersForMapping(),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // React query to fetch paperless forms config
  const paperlessFormConfigQuery = useQuery(
    ['paperlessFormsConfig'],
    () => paperlessForm.getPaperlessFormConfig('folder_od_def_id_default'),
    {
      enabled: foldersForMappingQuery.isSuccess,
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Mutate office configs
  const mutatePaperlessFormConfig = useMutation(
    (configObj) => paperlessForm.updatePaperlessFormConfigs(configObj),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData(['paperlessFormsConfig'], (oldData) => ({
          ...oldData,
          ...variables,
        }));
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Mutate form folder mapping
  const mutateFormMapping = useMutation(
    (obj) => paperlessForm.updateFormMapping(obj.formId, obj.reqObj),
    {
      onSuccess: (data, variables) => {
        console.log(variables);
        const queryData = queryClient.getQueryData(['paperlessFormsMeta']);
        const index = queryData.findIndex((d) => d.id === variables.formId);
        queryData[index].folder_def_od_id = variables.reqObj.folder_def_od_id;
        queryClient.setQueryData(['paperlessFormsMeta'], () => [...queryData]);
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle folder mapping change
  const handleFolderChange = async (formId, odDefId) => {
    mutateFormMapping.mutate({
      formId,
      reqObj: {
        folder_def_od_id: odDefId,
      },
    });
  };

  // React query to fetch paperless forms
  const formsMetaQuery = useQuery(
    ['paperlessFormsMeta'],
    () => paperlessForm.getFormsMeta(),
    {
      initialData: [],
      enabled: foldersForMappingQuery.isSuccess,
      select: (data) => {
        // sort forms alphabetically!
        const sortedData = data.sort((a, b) =>
          a.name.trim().localeCompare(b.name.trim()),
        );

        const mappedData = sortedData.map((d) => {
          const form = <span>{d.name}</span>;
          const odFolder = (
            <ControlledSelect
              selectedValue={d.folder_def_od_id}
              actions={[
                {
                  id: 0,
                  name: '- Default -',
                  value: '',
                  od_def_id: 0,
                },
                ...foldersForMappingQuery.data,
              ]}
              onChange={(odDefId) => handleFolderChange(d.id, odDefId)}
            />
          );
          return { id: d.id, form, odFolder };
        });

        return mappedData;
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  // Handle default mapping change
  const handleConfigChange = async (odDefId) => {
    await mutatePaperlessFormConfig.mutateAsync({
      folder_od_def_id_default: odDefId + '',
    });
  };

  return (
    <Grid className={styles.root}>
      <div className={styles.header}>
        <div className={styles.titlesContainer}>
          <span className={styles.title}>Patient Folder Mapping</span>
        </div>
      </div>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          {paperlessFormConfigQuery.isSuccess ? (
            <ControlledSelect
              selectedValue={
                paperlessFormConfigQuery.data.folder_od_def_id_default
              }
              actions={foldersForMappingQuery.data}
              onChange={(val) => handleConfigChange(val)}
            />
          ) : (
            <Skeleton variant="rect" width="100%" height={36} />
          )}
        </Grid>
        <Grid item xs={12} md={6} className={styles.subtitle}>
          Forms that do not have a folder assigned will be uploaded to this
          default folder
        </Grid>
      </Grid>

      <div className={styles.tableContainer}>
        <div style={{ height: '5px' }}>
          {formsMetaQuery.isFetching && <LinearProgress />}
        </div>
        <Table
          columns={tableColumns}
          rows={formsMetaQuery.data}
          sortBy={tableColumns[0].id}
          isSelectable={false}
          isEmpty={formsMetaQuery.isFetched && !formsMetaQuery.data.length}
        />
      </div>
    </Grid>
  );
}
