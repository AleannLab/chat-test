import React, { useEffect } from 'react';
import { MenuItem, Grid, makeStyles } from '@material-ui/core';
import SelectField from 'components/Core/Formik/SelectField';
import { useMutation, useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import ScheduleSkeleton from '../../Skeleton';
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

const PlayGreetingFailover = ({ values, isDataLoading }) => {
  const { incomingCalls, notification } = useStores();
  const classes = useStyles();

  const { data: greetingsData = [], isLoading: isLoadingGreetingData } =
    useQuery('getGreetingTypes', () => incomingCalls.getGreetingTypes(), {
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to fetch the greetings',
        ),
    });

  const {
    data: greetings = [],
    mutateAsync: getGreetingsById,
    isLoading: isLoadingGreetings,
  } = useMutation(
    'getGreetingsById',
    (Id) => incomingCalls.getGreetingsById(Id),
    {
      onError: () =>
        notification.showError(
          'An unexpected error occurred while attempting to fetch the greetings',
        ),
    },
  );

  useEffect(() => {
    if (
      values?.failoverGreetingAction &&
      typeof values?.failoverGreetingAction === 'number'
    ) {
      getGreetingsById(values?.failoverGreetingAction);
    }
  }, [values?.failoverGreetingAction]);

  const handleChangeGreetingListing = async (Id) => {
    await getGreetingsById(Id);
  };

  const getGreetingNameById = (uuid) =>
    greetings?.find((greeting) => greeting.uuid === uuid);

  return (
    <Grid container spacing={2} direction="row">
      {isLoadingGreetingData ? (
        <ScheduleSkeleton />
      ) : (
        <Grid item xs={6}>
          <SelectField
            mt={1}
            align="left"
            options={greetingsData.map(({ type, id }, index) => (
              <MenuItem
                key={index}
                value={id}
                onClick={() => handleChangeGreetingListing(id)}
              >
                <span style={{ gap: 5 }} className="d-flex align-items-center">
                  <span>{type}</span>
                </span>
              </MenuItem>
            ))}
            fieldName="failoverGreetingAction"
            fieldLabel="GREETING CATEGORY"
            disabled={isDataLoading}
          />
        </Grid>
      )}

      {isLoadingGreetingData || isLoadingGreetings ? (
        <ScheduleSkeleton />
      ) : (
        <Grid item xs={6}>
          <AutoCompleteInputField
            classes={{
              popupIndicator: classes.popupIndicator,
            }}
            placeholder="Select"
            disabled={isDataLoading}
            mt={1}
            fieldLabel="GREETING"
            fieldName="failoverGreetingValue"
            onChangeInput={() => {
              return;
            }}
            getOptionLabel={(uuid) => getGreetingNameById(uuid)?.name}
            renderOption={(uuid) => getGreetingNameById(uuid)?.name}
            suggestions={greetings?.map(({ uuid }) => {
              return uuid;
            })}
          />
        </Grid>
      )}
    </Grid>
  );
};
export default PlayGreetingFailover;
