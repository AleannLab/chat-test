import {
  Button,
  FormControl,
  Grid,
  makeStyles,
  MenuItem,
  Select,
} from '@material-ui/core';
import TextInputField from 'components/Core/Formik/TextInputField';
import Modal from 'components/Core/Modal';
import { Form, Formik } from 'formik';
import { useStores } from 'hooks/useStores';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import { ReactComponent as DeleteIcon } from 'assets/images/delete.svg';
import { useMutation, useQuery } from 'react-query';
import AutoCompleteInputField from 'components/Core/Formik/AutoCompleteInputField';
import { queryClient } from 'App';
import SelectField from 'components/Core/Formik/SelectField';
import PhoneInputField from 'components/Core/Formik/PhoneInputField';
import { Skeleton } from '@material-ui/lab';
import 'yup-phone';
import PhoneNumber from 'awesome-phonenumber';
import { ReactComponent as HardwarePhoneIcon } from 'assets/images/telephone.svg';

const useStyles = makeStyles({
  menuPaper: {
    maxHeight: 345,
  },
});

const TYPES = [
  {
    label: 'Agent',
    value: 'AGENT',
    typeID: 16,
  },
  {
    label: 'Speed Dial (External Number)',
    value: 'SD',
    typeID: 13,
  },
  {
    label: 'Park Line',
    value: 'PARK',
    typeID: 16,
  },
];

const PARKING_SPOTS = 30;

const transformObject = (label, line, type, value) => {
  return {
    [`linekey.${line}.label`]: label,
    [`linekey.${line}.line`]: Number(line),
    [`linekey.${line}.type`]: type,
    [`linekey.${line}.value`]: value,
  };
};

const EditLineModal = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const selectedType = params.get('type');
  const selectedValue = params.get('value');
  const selectedLabel = params.get('label');
  const [type, setType] = useState(TYPES[0].value);
  const history = useHistory();
  const { lineId, hardwarePhoneId } = useParams();
  const { incomingCalls, hardwarePhones, notification } = useStores();

  const isAgent = type === TYPES[0].value;
  const isSpeedDial = type === TYPES[1].value;
  const isParkedLine = type === TYPES[2].value;

  useEffect(() => {
    if (selectedType) {
      setType(selectedType);
    }
  }, [selectedType]);

  const handleClose = () => {
    history.goBack();
  };

  const getType = () => {
    if (isAgent || isParkedLine) return TYPES[0].typeID;
    if (isSpeedDial) return TYPES[1].typeID;
  };

  const { data: agents, isFetching: isFetchingAgents } = useQuery(
    ['usersAlongWithIncomingCalls'],
    () => incomingCalls.getUsers(),
    { staleTime: Infinity },
  );

  const { data, isFetching: isFetchingPhoneDetails } = useQuery(
    ['hardwarePhoneDetails', hardwarePhoneId],
    () => hardwarePhones.getHardwarePhone(hardwarePhoneId),
    {
      enabled: !!hardwarePhoneId,
      staleTime: Infinity,
    },
  );

  let hardwareConfig = data?.hardware_config?.line_keys || [];

  const extractSpotNumber = (value) => {
    return value?.replace(/^\D+/g, '');
  };

  const isSpotTaken = (spotNumber) => {
    let isTaken = false;
    if (isParkedLine && Number(extractSpotNumber(selectedValue)) === spotNumber)
      return;
    hardwareConfig.some((obj) => {
      const found = Object.values(obj).includes(`park+${spotNumber}`);
      if (found) isTaken = true;
    });
    return isTaken;
  };

  const isLabelTaken = (text) => {
    let isDuplicate = false;
    hardwareConfig.forEach((configObj) => {
      Object.keys(configObj).forEach((key, index) => {
        if (
          key === `linekey.${key.split('.')[1]}.label` &&
          text === configObj[key]
        ) {
          isDuplicate = true;
        }
      });
    });
    return isDuplicate;
  };

  const updatePhoneDirectoryMutation = useMutation(
    ['updatePhoneDirectory'],
    (data) => hardwarePhones.updateHardwarePhone(data),
    {
      onSuccess: () => {
        notification.showSuccess('Phone directory updated successfully');
        queryClient
          .invalidateQueries(['hardwarePhoneDetails', hardwarePhoneId])
          .then(handleClose);
      },
      onError: (error) => notification.showError(error.message),
    },
  );

  const insertIntoConfig = ({ line, label, type, value }) => {
    hardwareConfig.splice(
      line - 2,
      0,
      transformObject(label, line, type, value),
    );
  };

  const updateConfig = ({ line, label, type, value }) => {
    const newConfig = hardwareConfig?.map((item) => {
      const isFound = Object.keys(item).includes(`linekey.${line}.line`);
      if (isFound) return transformObject(label, line, type, value);
      else return item;
    });
    hardwareConfig = newConfig;
  };

  const getAgentById = (agentId) =>
    agents?.find((agent) => agent.id === agentId);
  const selectedAgent = getAgentById(selectedValue);

  const getInitialValues = () => {
    switch (true) {
      case isSpeedDial:
        return { phone: selectedValue };
      case isAgent:
        return {
          agent: selectedAgent?.id,
        };
      case isParkedLine:
        return { parkSpot: extractSpotNumber(selectedValue) ?? '' };
      default:
        return {};
    }
  };
  const initialValues = {
    agent: '',
    phone: '',
    parkSpot: '',
    label: '',
  };

  const selectedValues = {
    ...getInitialValues(),
    label: selectedLabel,
  };

  let validationSchema = Yup.object({
    agent: isAgent
      ? Yup.string().required('Agent is required')
      : Yup.string().notRequired(),
    phone: isSpeedDial
      ? Yup.string()
          .trim()
          .nullable()
          .required('Phone number is required')
          .phone('US', false, 'Invalid phone number')
      : Yup.string().notRequired(),
    parkSpot: isParkedLine
      ? Yup.string().required('Call park spot is required')
      : Yup.string().notRequired(),
    label: Yup.string()
      .test(
        'duplicate',
        'Label is already taken',
        (text) => !isLabelTaken(text),
      )
      .required('Label is required')
      .max(8, 'Label must be at most 8 characters'),
  });

  const handleSubmitForm = ({ agent, phone, label, parkSpot }) => {
    const config = {
      line: lineId,
      label,
      type: getType(),
      value: isSpeedDial
        ? new PhoneNumber(phone, 'US').getNumber('significant')
        : isAgent
        ? agent
        : `park+${parkSpot}`,
    };
    if (selectedType) {
      updateConfig(config);
    } else {
      insertIntoConfig(config);
    }
    updatePhoneDirectoryMutation.mutateAsync({
      data: { hardwareConfig },
      id: hardwarePhoneId,
    });
  };

  const handleClearLine = (line) => {
    const newConfig = hardwareConfig?.filter(
      (item) => !Object.keys(item).includes(`linekey.${line}.line`),
    );
    updatePhoneDirectoryMutation.mutateAsync({
      data: { hardwareConfig: newConfig },
      id: hardwarePhoneId,
    });
  };

  const isUpdating = updatePhoneDirectoryMutation.isLoading;
  const classes = useStyles();

  return (
    <Modal
      allowClosing={!isUpdating && !isFetchingPhoneDetails}
      size="sm"
      header={`Edit Line ${lineId}`}
      body={
        <Formik
          initialValues={selectedType ? selectedValues : initialValues}
          onSubmit={handleSubmitForm}
          validationSchema={validationSchema}
        >
          {({
            isSubmitting,
            setFieldValue,
            handleChange,
            setValues,
            values,
          }) => {
            const isDisabled =
              isSubmitting || isUpdating || isFetchingPhoneDetails;
            return (
              <Form>
                <label
                  style={{ marginTop: 24, marginBottom: 8, color: '#999999' }}
                >
                  TYPE
                </label>
                <FormControl
                  variant="outlined"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Select
                    disabled={isDisabled}
                    value={type}
                    onChange={(e) => {
                      setValues({ ...initialValues });
                      setType(e.target.value);
                    }}
                  >
                    {TYPES?.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {isAgent ? (
                      !agents?.length ? (
                        <Skeleton
                          style={{ marginTop: 35 }}
                          height={55}
                          width={246}
                        />
                      ) : (
                        <AutoCompleteInputField
                          loading={!agents?.length}
                          disabled={isDisabled || !agents?.length}
                          placeholder="Select"
                          mt={3}
                          fieldLabel="AGENT"
                          fieldName="agent"
                          onChangeInput={() => {}}
                          getOptionLabel={(id) => getAgentById(id)?.fullname}
                          renderOption={(id) => (
                            <div>
                              {getAgentById(id)?.mac_address ? (
                                <HardwarePhoneIcon
                                  className="me-2"
                                  width={18}
                                  height={18}
                                  fill="#566F9F"
                                />
                              ) : null}
                              {getAgentById(id)?.fullname}
                            </div>
                          )}
                          suggestions={agents?.map(({ id }) => {
                            return id;
                          })}
                          required
                        />
                      )
                    ) : isSpeedDial ? (
                      <PhoneInputField
                        placeholder={'Enter a 10 digit number'}
                        disabled={isSubmitting || isUpdating}
                        fieldLabel="PHONE"
                        fieldName="phone"
                        type="text"
                        required
                      />
                    ) : (
                      <SelectField
                        SelectProps={{
                          MenuProps: { classes: { paper: classes.menuPaper } },
                        }}
                        fieldName="parkSpot"
                        fieldLabel="CALL PARK SPOT"
                        disabled={isDisabled}
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue('label', `Park ${e.target.value}`);
                        }}
                        options={new Array(PARKING_SPOTS)
                          .fill()
                          .map((_, index) => index + 1)
                          .map((parkSpot) => (
                            <MenuItem
                              disabled={isSpotTaken(parkSpot)}
                              key={parkSpot}
                              value={parkSpot}
                            >
                              {parkSpot}
                            </MenuItem>
                          ))}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <TextInputField
                      placeholder={'Enter a label'}
                      maxLength={8}
                      disabled={isDisabled}
                      fieldLabel="LABEL (8 CHAR)"
                      fieldName="label"
                      type="text"
                      required
                    />
                  </Grid>
                </Grid>

                <div className="d-flex justify-content-between mt-5">
                  <Button
                    onClick={handleClose}
                    size="large"
                    variant="outlined"
                    color="primary"
                    disabled={isDisabled}
                  >
                    Cancel
                  </Button>
                  <div>
                    <Button
                      size="large"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleClearLine(lineId)}
                      variant="outlined"
                      color="primary"
                      disabled={isDisabled || !selectedType}
                    >
                      Clear Line
                    </Button>
                    <Button
                      size="large"
                      style={{ marginLeft: '10px' }}
                      variant="contained"
                      color="secondary"
                      disabled={isDisabled}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      }
      onClose={handleClose}
    />
  );
};

export default EditLineModal;
