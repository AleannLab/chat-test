import React from 'react';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';
import { MenuItem, Grid, makeStyles } from '@material-ui/core';
import TextInputField from 'components/Core/Formik/TextInputField';
import SelectField from 'components/Core/Formik/SelectField';
import { useQuery } from 'react-query';
import { useStores } from 'hooks/useStores';
import { observer } from 'mobx-react';
import ScheduleSkeleton from '../Skeleton';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import InternalFailover from '../Failover/InternalFailover';
import PlayGreetingFailover from '../Failover/PlayGreetingFailover';

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
const dummyCallerIdOptions = [
  {
    label: 'Originating caller number',
    value: 'originating_caller_number',
  },
  {
    label: 'Company caller number',
    value: 'company_caller_number',
  },
];

const ForwardToPhoneNumber = observer(
  ({ values, isSubmitting, setFieldValue }) => {
    const { incomingCalls, notification } = useStores();
    const classes = useStyles();

    const isPhoneInputRendering = (isRendering) =>
      isRendering === 'other' ? true : false;

    const { data: numbers = [], isLoading: isLoadingNumbers } = useQuery(
      'getForwardingNumbers',
      () => incomingCalls.getForwardingNumbers(),
      {
        onError: () =>
          notification.showError(
            'An unexpected error occurred while attempting to fetch the numbers',
          ),
      },
    );

    const getNumberByDid = (did) =>
      numbers?.find((number) => number.did === did);

    const renderPhoneInput = (
      <Grid item xs={6}>
        <PhoneInputField
          mt={1}
          placeholder={'Enter a 10 digit number'}
          disabled={isSubmitting}
          fieldLabel="PHONE"
          fieldName="value"
          type="text"
          required
        />
      </Grid>
    );
    return isLoadingNumbers ? (
      <ScheduleSkeleton isFull={true} />
    ) : (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <AutoCompleteInputField
            classes={{
              popupIndicator: classes.popupIndicator,
            }}
            mt={1}
            placeholder="Select"
            align="left"
            fieldName="saved_number"
            fieldLabel="SAVED NUMBER"
            onChangeInput={() => {
              return;
            }}
            getOptionLabel={(did) => getNumberByDid(did)?.did}
            renderOption={(did) => (
              <span
                style={{ gap: 5 }}
                className="d-flex align-items-center"
                onClick={() =>
                  setFieldValue('action', 'forward_to_phone', false)
                }
              >
                <span>{`${getNumberByDid(did)?.name}: ${did}`}</span>
              </span>
            )}
            suggestions={numbers?.map(({ did }) => did)}
          />
        </Grid>

        {isPhoneInputRendering(values.saved_number) && renderPhoneInput}
        <Grid item xs={isPhoneInputRendering(values.saved_number) ? 12 : 6}>
          <SelectField
            mt={1}
            align="left"
            options={dummyCallerIdOptions.map(({ value, label, color }) => (
              <MenuItem key={value} value={value}>
                <span style={{ gap: 5 }} className="d-flex align-items-center">
                  <span>{label}</span>
                </span>
              </MenuItem>
            ))}
            fieldName="caller_id"
            fieldLabel="CALLER ID"
          />
        </Grid>

        <InternalFailover values={values} />

        <Grid item xs={6}>
          <TextInputField
            mt={1}
            variant="outlined"
            disabled={isSubmitting}
            fieldName="timeout_sec"
            fieldLabel="TIMEOUT IF NO ANSWER (SECONDS)"
            placeholder="30"
            type="number"
            min={0}
            step={5}
          />
        </Grid>
        {values.internalFailoverAction === 'forward_to_greeting' && (
          <Grid item xs={12}>
            <PlayGreetingFailover values={values} />
          </Grid>
        )}
      </Grid>
    );
  },
);

export default ForwardToPhoneNumber;
