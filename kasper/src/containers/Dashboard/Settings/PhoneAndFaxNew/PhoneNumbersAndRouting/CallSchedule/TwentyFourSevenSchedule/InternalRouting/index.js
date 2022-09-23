import React, { useEffect } from 'react';
import { MenuItem, Grid, makeStyles, Box } from '@material-ui/core';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import ScheduleSkeleton from '../Skeleton';
import TextInputField from 'components/Core/Formik/TextInputField';
import { useMutation } from 'react-query';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import PlayGreetingFailover from '../Failover/PlayGreetingFailover';
import InternalFailover from '../Failover/InternalFailover';

const useStyles = makeStyles({
  root: {
    background: 'transparent',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'transparent !important',
    },
    '& .MuiOutlinedInput-root': {
      background: 'transparent !important',
    },
  },
  popupIndicator: {
    marginTop: '2px',
  },
  noBorder: {
    border: 'none',
  },
});
const dummyForwardToOptions = [
  {
    label: 'Forward to agent',
    value: 'forward_to_exten',
  },
  {
    label: 'Forward to group',
    value: 'forward_to_group',
  },
  {
    label: 'Forward to call tree',
    value: 'forward_to_ivr',
  },
];

const InternalRouting = ({ values, setFieldValue }) => {
  const { incomingCalls, notification } = useStores();
  const classes = useStyles();

  const {
    data: groupsData = [],
    mutateAsync: getGroups,
    isLoading: isLoadingGroups,
  } = useMutation('getGroups', () => incomingCalls.getGroups(), {
    onError: () =>
      notification.showError(
        'An unexpected error occurred while attempting to fetch the groups',
      ),
    retry: false,
  });
  const {
    data: agentsData = [],
    mutateAsync: getAgents,
    isLoading: isLoadingAgents,
  } = useMutation('getAgents', () => incomingCalls.getAgents(), {
    onError: () =>
      notification.showError(
        'An unexpected error occurred while attempting to fetch the agents',
      ),
    retry: false,
  });
  const {
    data: ivrData = [],
    mutateAsync: getIvrs,
    isLoading: isLoadingIvrList,
  } = useMutation('getIvrList', () => incomingCalls.getIvrList(), {
    onError: () =>
      notification.showError(
        'An unexpected error occurred while attempting to fetch the ivr(s)',
      ),
    retry: false,
  });

  useEffect(() => {
    if (values?.action === 'forward_to_exten') {
      getAgents();
    }
    if (values?.action === 'forward_to_group') {
      getGroups();
    }
    if (values?.action === 'forward_to_ivr') {
      getIvrs();
    }
  }, [values.action]);

  const getGroupNameById = (uuid) =>
    groupsData?.find((group) => group.uuid === uuid);

  const getAgentNameById = (id) =>
    [...agentsData, { fullname: 'All', id: 'all' }]?.find(
      (agent) => agent.id === id,
    );

  const getIvrNameById = (uuid) => ivrData?.find((ivr) => ivr.uuid === uuid);

  const isDataLoading = isLoadingGroups || isLoadingAgents || isLoadingIvrList;

  const agentSelect = (
    <Grid item xs={6}>
      <AutoCompleteInputField
        classes={{
          popupIndicator: classes.popupIndicator,
        }}
        mt={1}
        placeholder="Select"
        align="left"
        fieldName="value"
        fieldLabel="CHOOSE AGENT"
        disabled={isDataLoading || !values?.action}
        onChangeInput={() => {
          return;
        }}
        getOptionLabel={(id) => getAgentNameById(id)?.fullname}
        renderOption={(id) => getAgentNameById(id)?.fullname}
        suggestions={[...agentsData, { fullname: 'All', id: 'all' }]?.map(
          ({ id }) => {
            return id;
          },
        )}
      />
    </Grid>
  );

  const groupSelect = (
    <Grid item xs={6}>
      <AutoCompleteInputField
        classes={{
          popupIndicator: classes.popupIndicator,
        }}
        mt={1}
        placeholder="Select"
        align="left"
        fieldName="value"
        fieldLabel="GROUP"
        disabled={isDataLoading}
        onChangeInput={() => {
          return;
        }}
        getOptionLabel={(uuid) => getGroupNameById(uuid)?.name}
        renderOption={(uuid) => getGroupNameById(uuid)?.name}
        suggestions={groupsData?.map(({ uuid }) => {
          return uuid;
        })}
      />
    </Grid>
  );

  const treeSelect = (
    <Grid item xs={6}>
      <AutoCompleteInputField
        classes={{
          popupIndicator: classes.popupIndicator,
        }}
        mt={1}
        placeholder="Select"
        align="left"
        fieldName="value"
        fieldLabel="CALL TREE"
        disabled={isDataLoading}
        onChangeInput={() => {
          return;
        }}
        getOptionLabel={(uuid) => getIvrNameById(uuid)?.name}
        renderOption={(uuid) => getIvrNameById(uuid)?.name}
        suggestions={ivrData?.map(({ uuid }) => {
          return uuid;
        })}
      />
    </Grid>
  );

  const renderForwardToSelect = (value) => {
    switch (value) {
      case 'forward_to_exten':
        return agentSelect;
      case 'forward_to_group':
        return groupSelect;
      case 'forward_to_ivr':
        return treeSelect;
      default:
        return agentSelect;
    }
  };
  const getList = (value) => {
    switch (value) {
      case 'forward_to_exten':
        return getAgents();
      case 'forward_to_group':
        return getGroups();
      case 'forward_to_ivr':
        return getIvrs();
      default:
        return null;
    }
  };

  return (
    <>
      <label
        style={{
          fontFamily: 'Playfair Display',
          fontStyle: 'normal',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          color: '#0D2145',
          marginTop: '1rem',
        }}
      >
        Forward
      </label>
      <Box
        sx={{ background: '#F0F3F8' }}
        marginY="0.3rem"
        padding="1rem"
        width="100%"
      >
        <Grid container spacing={2}>
          <>
            <Grid item xs={6}>
              <SelectField
                mt={1}
                align="left"
                options={dummyForwardToOptions.map(({ value, label }) => (
                  <MenuItem
                    key={value}
                    value={value}
                    onClick={() => getList(value)}
                  >
                    <span
                      style={{ gap: 5 }}
                      className="d-flex align-items-center"
                    >
                      <span>{label}</span>
                    </span>
                  </MenuItem>
                ))}
                fieldName="action"
                fieldLabel="FORWARD TO"
                disabled={isDataLoading}
              />
            </Grid>
          </>
          {isDataLoading ? (
            <ScheduleSkeleton />
          ) : (
            renderForwardToSelect(values.action)
          )}
        </Grid>
      </Box>
      {values.action !== 'forward_to_ivr' && (
        <>
          <label
            style={{
              fontFamily: 'Playfair Display',
              fontStyle: 'normal',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              color: '#0D2145',
              marginTop: '1rem',
            }}
          >
            Timeout
          </label>
          <Box
            sx={{ background: '#F0F3F8' }}
            marginY="0.3rem"
            padding="1rem"
            width="100%"
          >
            <Grid container spacing={2}>
              <InternalFailover values={values} setFieldValue={setFieldValue} />
              <Grid item xs={6}>
                <TextInputField
                  mt={1}
                  variant="outlined"
                  disabled={isDataLoading}
                  fieldName="timeout_sec"
                  fieldLabel="TIMEOUT IF NO ANSWER (SECONDS)"
                  type="number"
                  min={0}
                  step={5}
                />
              </Grid>
            </Grid>
          </Box>
          {values.internalFailoverAction === 'forward_to_greeting' && (
            <Grid item xs={12}>
              <PlayGreetingFailover values={values} />
            </Grid>
          )}
        </>
      )}
    </>
  );
};

export default InternalRouting;
