import React, { useEffect, useState } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Paper from '@material-ui/core/Paper';
import { observer } from 'mobx-react';
import { useQuery } from 'react-query';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import { useStores } from 'hooks/useStores';
import ProviderCard from '../ProviderCard';
import ProviderCardSkeleton from '../ProviderCard/ProviderCardSkeleton';
import Notification from 'components/Notification';
import { ReactComponent as CorrectIcon } from 'assets/images/correct-arrow.svg';
import { ReactComponent as InfoIcon } from '../../assets/info-icon.svg';
import styles from './index.module.css';
import './index.css';
import { convertHexToRGBA } from 'helpers/misc';

const PatientProviderInfo = observer(() => {
  const { onlineSchedule, notification } = useStores();
  const [maintainProviderSelection, setMaintainProviderSelection] =
    useState(false);

  const fetchPractitionersMonthScheduleQuery = useQuery(
    [
      'fetchPractitionersMonthSchedule',
      onlineSchedule.dateTime.startDate,
      onlineSchedule.appointmentConfig.selectedAppointment.id,
    ],
    () => onlineSchedule.fetchPractitionersMonthSchedule(),
    {
      enabled: !onlineSchedule.isSelectedAppointmentEmpty,
      onSuccess: (data) => {
        if (data.length > 0) {
          let arr = [];
          data.forEach((ele) => {
            arr.push(ele.disabledSchedule);
            onlineSchedule.setPractitionerBusyDays(
              ele.id,
              ele.disabledSchedule,
            );
          });
          // Get intersection or common elements from all the arrays
          let result = arr.reduce((a, b) =>
            b.filter(Set.prototype.has, new Set(a)),
          );
          onlineSchedule.setPractitionerBusyDays('any', result);
          onlineSchedule
            .fetchAvailableSlots()
            .then(() => {
              if (!maintainProviderSelection) {
                onlineSchedule.setAnyProvider(true);
              } else if (!onlineSchedule.anyProvider) {
                onlineSchedule.filterDaysByPractitioner(
                  onlineSchedule.practitionerData.selectedPractitioner.id,
                );
                onlineSchedule.filterAppointmentTimeByPractitioner(
                  onlineSchedule.practitionerData.selectedPractitioner.id,
                );
              }
              setMaintainProviderSelection(true);
              onlineSchedule.setDateTime({ time: '' });
              onlineSchedule.setDisable(false);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      },
      onError: (err) => {
        notification.showError(err.message);
      },
    },
  );

  useEffect(() => {
    onlineSchedule.fetchAppointmentTypes().catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the appointments',
      );
    });
    onlineSchedule.fetchPaymentTypes();
    onlineSchedule.fetchVacation().catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the schedule',
      );
    });
    onlineSchedule.fetchOfficeInformation().catch(() => {
      notification.showError(
        'An unexpected error occurred while attempting to fetch the office information',
      );
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onlineSchedule.setDateTime({ time: '' });
  }, [onlineSchedule.patientType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      !!onlineSchedule.anyProvider &&
      !!onlineSchedule.slotsCopy &&
      onlineSchedule.slotsCopy.length &&
      !!onlineSchedule.dateTime.time
    ) {
      setRandomPractitioner();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onlineSchedule.anyProvider,
    onlineSchedule.slotsCopy,
    onlineSchedule.dateTime.time,
  ]);

  const setRandomPractitioner = () => {
    // Find provider available according to the selected time slot
    const { provider } = onlineSchedule.slotsCopy.find((slot) => {
      return (
        moment
          .utc(slot.slot)
          .tz(onlineSchedule.officeInformation.timezone)
          .format('LT') ===
        moment
          .utc(onlineSchedule.dateTime.time)
          .tz(onlineSchedule.officeInformation.timezone)
          .format('LT')
      );
    });

    if (!!provider && provider.length) {
      const randomPractitionerId =
        provider[Math.floor(Math.random() * provider.length)];
      const randomPractitioner = fetchPractitionersMonthScheduleQuery.data.find(
        ({ id }) => id === randomPractitionerId,
      );
      onlineSchedule.setPractitionerData({
        selectedPractitioner: {
          id: randomPractitioner.id,
          name: `${randomPractitioner.f_name || ''} ${
            randomPractitioner.l_name || ''
          }`,
          type: randomPractitioner.speciality,
        },
      });
    } else {
      throw Error(
        'No provider found for selected time slot, please select appropriate provider',
      );
    }
  };

  const selectAnyProvider = () => {
    if (!onlineSchedule.disable) {
      onlineSchedule.setAnyProvider(true);
      onlineSchedule.filterDaysByPractitioner('any');
      onlineSchedule.filterAppointmentTimeByPractitioner('any');
      onlineSchedule.setDateTime({ time: '' });
    }
  };

  const selectPractitioner = ({ id, name, type }) => {
    onlineSchedule.setAnyProvider(false);
    onlineSchedule.setPractitionerData({
      selectedPractitioner: { id, name, type },
    });
    onlineSchedule.filterDaysByPractitioner(id);
    onlineSchedule.filterAppointmentTimeByPractitioner(id);
    onlineSchedule.setDateTime({ time: '' });
  };

  const handlePatientType = (event, newType) => {
    if (newType) {
      onlineSchedule.setPatientType(newType);
      onlineSchedule.filterAppointmentTypeByPatientType({
        patientType: newType.toLowerCase(),
      });
      onlineSchedule.setAppointmentConfig({
        selectedAppointment: {
          available_for: '',
          id: null,
          label: null,
          value: null,
        },
      });
    }
  };

  const handleAppointmentType = (event) => {
    onlineSchedule.setDisable(true);
    onlineSchedule.setAnyProvider(false);
    setMaintainProviderSelection(false);
    const obj = onlineSchedule.appointmentConfig.filteredAppointmentTypes.find(
      (appointment) => {
        if (appointment.id === event.target.value) {
          return appointment;
        }
        return null;
      },
    );
    onlineSchedule.setAppointmentConfig({ selectedAppointment: obj });
    // if (!onlineSchedule.isPractitionerEmpty) {
    //   onlineSchedule.setPractitionerData({ selectedPractitioner: '' });
    // }
    // onlineSchedule.setDateTime({ time: '' });
  };

  const buttonStyle = {
    backgroundColor: convertHexToRGBA(
      onlineSchedule.officeInformation.brandColor,
      12,
    ),
    color: onlineSchedule.officeInformation.brandColor,
    borderColor: onlineSchedule.officeInformation.brandColor,
  };

  return (
    <div className={styles.container}>
      <Grid
        container
        spacing={2}
        className={`${styles.selectionContainer} cst-info`}
      >
        <Grid item xs={12} md={6}>
          <InputLabel className={styles.label}>
            NEW OR RETURNING PATIENT:{' '}
          </InputLabel>
          <ToggleButtonGroup
            color="primary"
            onChange={handlePatientType}
            exclusive
            value={onlineSchedule.patientType}
          >
            <ToggleButton
              value="New"
              className={styles.toggleButton}
              style={onlineSchedule.patientType === 'New' ? buttonStyle : {}}
            >
              New
            </ToggleButton>
            <ToggleButton
              value="Returning"
              className={styles.toggleButton}
              style={
                onlineSchedule.patientType === 'Returning' ? buttonStyle : {}
              }
            >
              Returning
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          className={`${
            onlineSchedule.isSelectedAppointmentEmpty
              ? 'cst-grey-select'
              : 'cst-other-select'
          }`}
        >
          <InputLabel className={styles.label}>REASON FOR VISIT:</InputLabel>
          <Select
            className={styles.select}
            disabled={
              onlineSchedule.appointmentConfig.appointmentTypes.length === 0
            }
            value={
              onlineSchedule.appointmentConfig.selectedAppointment.id || ''
            }
            variant="outlined"
            onChange={handleAppointmentType}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select
            </MenuItem>
            {onlineSchedule.appointmentConfig.filteredAppointmentTypes.map(
              (appointment) => (
                <MenuItem key={appointment.id} value={appointment.id}>
                  {appointment.label}
                </MenuItem>
              ),
            )}
          </Select>
        </Grid>
      </Grid>
      <div className={styles.providerInfoContainer}>
        <div className={styles.providerInfoTitleContainer}>
          <span className={styles.availableProviders}>Available Providers</span>
          <span className={styles.date}>
            {moment(onlineSchedule.dateTime.date).format('LL')}
          </span>
        </div>
        {!onlineSchedule.isSelectedAppointmentEmpty ? (
          <div
            style={{
              height: '377px',
              overflow: 'scroll',
              marginRight: '-14px',
            }}
          >
            <div className={styles.providerSelectionContainer}>
              <div>
                <Paper
                  onClick={selectAnyProvider}
                  className={`${
                    onlineSchedule.disable
                      ? styles.anyProviderDisabledContainer
                      : styles.anyProviderContainer
                  }`}
                >
                  <span className={styles.anyProvider}>Any Provider</span>
                  <div
                    className={`${
                      onlineSchedule.anyProvider
                        ? 'cst-any-selected'
                        : 'cst-any'
                    }`}
                  >
                    <ToggleButton
                      value="selected"
                      size="small"
                      disabled={
                        onlineSchedule.practitionerData.practitionerIds
                          .length === 0
                      }
                      selected={onlineSchedule.anyProvider}
                      className={styles.selectButton}
                      style={buttonStyle}
                    >
                      {onlineSchedule.anyProvider ? (
                        <div className={styles.selectedButton}>
                          <CorrectIcon
                            fill={onlineSchedule.officeInformation.brandColor}
                            className={styles.correctIcon}
                          />
                          Selected
                        </div>
                      ) : (
                        <span>Select</span>
                      )}
                    </ToggleButton>
                  </div>
                </Paper>
              </div>
              {fetchPractitionersMonthScheduleQuery.isFetching &&
                [...Array(4)].map((ele, index) => (
                  <ProviderCardSkeleton index={index} key={index} />
                ))}
              {!!fetchPractitionersMonthScheduleQuery.data &&
                fetchPractitionersMonthScheduleQuery.data.map(
                  (practitioner, index) => (
                    <div
                      key={practitioner.id}
                      className={styles.providerCardDiv}
                    >
                      <ProviderCard
                        id={practitioner.id}
                        index={index}
                        firstName={practitioner.f_name}
                        lastName={practitioner.l_name}
                        suffix={practitioner.suffix}
                        speciality={practitioner.speciality}
                        displayImage={practitioner.display_image}
                        bio={practitioner.bio}
                        disabled={onlineSchedule.disable}
                        selectPractitioner={selectPractitioner}
                        selected={
                          !onlineSchedule.isPractitionerEmpty &&
                          onlineSchedule.practitionerData.selectedPractitioner
                            .id === practitioner.id &&
                          !onlineSchedule.anyProvider
                        }
                        brandColor={onlineSchedule.officeInformation.brandColor}
                      />
                    </div>
                  ),
                )}
            </div>
          </div>
        ) : (
          <div className={styles.noSelectionContainer}>
            <InfoIcon />
            <span className={styles.noSelectionText}>
              From the options above, please select if you are a new or
              returning patient, and the reason for your visit.
            </span>
          </div>
        )}
      </div>
      <Notification />
    </div>
  );
});

export default PatientProviderInfo;
