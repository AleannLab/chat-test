import React, { useEffect } from 'react';
import { MenuItem, Grid, makeStyles } from '@material-ui/core';
import SelectField from 'components/Core/Formik/SelectField';
import { useStores } from 'hooks/useStores';
import ScheduleSkeleton from '../../Skeleton';
import { useMutation, useQuery } from 'react-query';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';

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
  {
    label: 'Play Greeting',
    value: 'forward_to_greeting',
  },
];

const InternalFailover = ({ values }) => {
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
    if (values?.internalFailoverAction === 'forward_to_exten') {
      getAgents();
    }
    if (values?.internalFailoverAction === 'forward_to_group') {
      getGroups();
    }
    if (values?.internalFailoverAction === 'forward_to_ivr') {
      getIvrs();
    }
  }, [values.internalFailoverAction]);

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
        fieldName="internalFailoverValue"
        fieldLabel="CHOOSE AGENT"
        disabled={isDataLoading || !values?.internalFailoverAction}
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
        fieldName="internalFailoverValue"
        fieldLabel="GROUP"
        disabled={isDataLoading || !values?.internalFailoverAction}
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
        fieldName="internalFailoverValue"
        fieldLabel="CALL TREE"
        disabled={isDataLoading || !values?.internalFailoverAction}
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
                <span style={{ gap: 5 }} className="d-flex align-items-center">
                  <span>{label}</span>
                </span>
              </MenuItem>
            ))}
            fieldName="internalFailoverAction"
            fieldLabel="TIMEOUT BEHAVIOR"
            disabled={isDataLoading}
          />
        </Grid>
        {values.internalFailoverAction !== 'forward_to_greeting' && (
          <>
            {isDataLoading ? (
              <ScheduleSkeleton negativeMargin={true} />
            ) : (
              renderForwardToSelect(values.internalFailoverAction)
            )}
          </>
        )}
      </>
    </>
  );
};

export default InternalFailover;
