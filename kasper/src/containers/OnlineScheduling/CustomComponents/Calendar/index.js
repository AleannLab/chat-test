import React, { useEffect, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, Calendar } from '@material-ui/pickers';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Grid from '@material-ui/core/Grid';
import { observer } from 'mobx-react';
import moment from 'moment-timezone';
import Button from '@material-ui/core/Button';
import { useQueryClient } from 'react-query';
import Notification from 'components/Notification';
import { useStores } from 'hooks/useStores';
import styles from './index.module.css';
import './index.css';
import { convertHexToRGBA } from 'helpers/misc';
import { createTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import useResponsive from 'hooks/useResponsive';
import { REQUIRED_MESSAGE_ONLINE_SCHEDULE } from 'helpers/constants';
import { flatten } from 'lodash';

const CustomCalendar = observer(() => {
  const { onlineSchedule, notification } = useStores();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const [calendarTheme, setCalendarTheme] = useState({});
  const responsiveInfo = useResponsive();

  const startTime = moment('2013-02-08').add(7, 'hours');
  const intervalCount = 30;
  const timeSlotCount = Math.floor((12.5 * 60) / intervalCount);

  const practitionerData = queryClient.getQueryState(
    ['fetchPractitionersMonthSchedule'],
    { active: true },
  );

  useEffect(() => {
    setIsLoading(!!practitionerData?.isFetching);
  }, [practitionerData]);

  useEffect(
    () => {
      if (
        !onlineSchedule.isSelectedAppointmentEmpty &&
        onlineSchedule.appointmentConfig.procedureTime !== null &&
        onlineSchedule.slots.length === 0
      ) {
        notification.showInfo(
          'No time slots are available for the selected date and provider',
        );
      }
    },
    // prettier-ignore
    [onlineSchedule.isSelectedAppointmentEmpty, onlineSchedule.appointmentConfig.procedureTime, onlineSchedule.slots.length,], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    setCalendarTheme(
      createTheme({
        overrides: {
          MuiPickersCalendar: {
            transitionContainer: {
              transform: `scale(${responsiveInfo.isDesktop ? 1.2 : 1})`,
              marginTop: '40px',
            },
          },
          MuiPickersCalendarHeader: {
            transitionContainer: {
              width: '50%',
              height: '2rem',
            },
            dayLabel: {
              fontFamily: 'Montserrat',
              color: '#02122F',
              fontSize: '1rem',
              fontWeight: '600',
              margin: '0px 3px',
            },
            daysHeader: {
              transform: `scale(${responsiveInfo.isDesktop ? 1.2 : 1})`,
            },
          },
          MuiPickersDay: {
            day: {
              borderRadius: '3px',
              margin: '3px',
              background: '#F0F3F8',
            },
            daySelected: {
              color: onlineSchedule.officeInformation.brandColor,
              backgroundColor: convertHexToRGBA(
                onlineSchedule.officeInformation.brandColor,
                12,
              ),
              borderRadius: '5px',
              border: `1px solid ${onlineSchedule.officeInformation.brandColor}`,
            },
            dayDisabled: {
              backgroundColor: '#F4F4F4',
              color: '#999999',
            },
            current: {
              color: onlineSchedule.officeInformation.brandColor,
              border: '0px',
            },
          },
          MuiPickersSlideTransition: {
            transitionContainer: {
              '& div, p': { transition: '0s' },
            },
            'slideExitActiveLeft-left': {
              '& div': { display: 'none' },
            },
            'slideExitActiveLeft-right': {
              '& div': { display: 'none' },
            },
          },
          MuiTypography: {
            body1: {
              fontFamily: 'Montserrat',
              fontSize: '1.5rem',
              fontWeight: '500',
              color: '#02122F',
            },
            body2: {
              fontFamily: 'Montserrat',
              fontSize: '1rem',
              fontWeight: '500',
            },
          },
        },
      }),
    );
  }, [onlineSchedule.officeInformation.brandColor, responsiveInfo.isDesktop]);

  const handleDateChange = (date) => {
    onlineSchedule.setDateTime({ date, time: '' });
    // onlineSchedule.setAnyProvider(false);
    // onlineSchedule.setPractitionerData({ selectedPractitioner: {} });
    if (!onlineSchedule.isSelectedAppointmentEmpty) {
      onlineSchedule.setDisable(true);
      onlineSchedule
        .fetchAvailableSlots()
        .then(() => {
          onlineSchedule.filterPractitionersByDate({});
          onlineSchedule.setDisable(false);
          onlineSchedule.filterDaysByPractitioner(
            onlineSchedule.practitionerData.selectedPractitioner.id,
          );
          if (!onlineSchedule.anyProvider) {
            onlineSchedule.filterAppointmentTimeByPractitioner(
              onlineSchedule.practitionerData.selectedPractitioner.id,
            );
          }
          onlineSchedule.setDateTime({ time: '' });
          // onlineSchedule.setAnyProvider(true);
        })
        .catch(() => {
          notification.showError(
            'An unexpected error occurred while attempting to fetch the available date and time',
          );
        });
    }
  };

  const checkSelection = (index) => {
    if (onlineSchedule.slots.length === 0) {
      return false;
    } else {
      return (
        moment
          .utc(onlineSchedule.slots[index].slot)
          .tz(onlineSchedule.officeInformation.timezone)
          .format('LT') === moment(onlineSchedule.dateTime.time).format('LT')
      );
    }
  };

  const toggleTime = (index) => {
    let convertedTime = moment
      .utc(onlineSchedule.slots[index].slot)
      .tz(onlineSchedule.officeInformation.timezone);
    if (onlineSchedule.dateTime.time.length === 0) {
      onlineSchedule.setDateTime({ time: convertedTime });
    } else {
      if (
        moment(onlineSchedule.dateTime.time).format('LT') ===
        convertedTime.format('LT')
      ) {
        onlineSchedule.setDateTime({ time: '' });
      } else {
        onlineSchedule.setDateTime({ time: convertedTime });
      }
    }
  };

  const checkProviderAppointmentSelection = () => {
    return (
      onlineSchedule.dateTime.time.length !== 0 &&
      (!onlineSchedule.isPractitionerEmpty || onlineSchedule.anyProvider)
    );
  };

  const setRequiredFieldMessage = () => {
    let messages = [];
    let message;

    if (onlineSchedule.appointmentConfig.selectedAppointment.value === null) {
      messages.push(REQUIRED_MESSAGE_ONLINE_SCHEDULE.reasonForVisit);
    }
    if (onlineSchedule.isPractitionerEmpty && !onlineSchedule.anyProvider) {
      messages.push(REQUIRED_MESSAGE_ONLINE_SCHEDULE.provider);
    }
    if (onlineSchedule.dateTime.time.length === 0) {
      messages.push(REQUIRED_MESSAGE_ONLINE_SCHEDULE.appointmentTime);
    }
    if (messages.length !== 0) {
      message = `Select ${flatten(messages).join(', ')}.`;
    }

    return message;
  };

  const setInvalidDays = (day) => {
    let parseFormat = 'YYYY-MM-DD';
    let filtered = onlineSchedule.vacations.filter((vacation) => {
      return (
        moment(day, parseFormat).isSameOrAfter(
          moment(vacation.from, parseFormat),
          'day',
        ) && moment(day).isSameOrBefore(moment(vacation.to, parseFormat))
      );
    });

    let invalid = false;
    onlineSchedule.practitionerBusyDays['any'].forEach((busyDays) => {
      if (busyDays.includes(moment(day).format(parseFormat))) {
        invalid = true;
      }
    });

    return filtered.length !== 0 || invalid;
  };

  const handleTimeSlotClick = (index) => {
    toggleTime(index);
    // onlineSchedule.filterPractitionersByDate({
    //   index,
    //   time: onlineSchedule.dateTime.time,
    // });
  };

  console.log(
    onlineSchedule.isSelectedAppointmentEmpty,
    onlineSchedule.disable,
  );

  return (
    <Grid container className={styles.calendarContainer}>
      <Grid container item>
        <Grid item xs={12} md={9}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div
              className={`cst-calendar ${
                isLoading ? 'cst-calendar-loading' : ''
              }`}
            >
              <ThemeProvider theme={calendarTheme}>
                <Calendar
                  allowKeyboardControl={false}
                  date={onlineSchedule.dateTime.date}
                  onChange={handleDateChange}
                  onMonthChange={(date) => {
                    onlineSchedule.setDisable(true);
                    onlineSchedule.setDateTime({
                      date: date,
                      startDate: moment(date)
                        .startOf('month')
                        .format('YYYY-MM-DD'),
                      endDate: moment(date).endOf('month').format('YYYY-MM-DD'),
                    });
                  }}
                  disablePast={true}
                  shouldDisableDate={(day) => {
                    if (
                      onlineSchedule.isSelectedAppointmentEmpty ||
                      onlineSchedule.disable
                    ) {
                      return true;
                    } else {
                      return setInvalidDays(day);
                    }
                  }}
                />
              </ThemeProvider>
            </div>
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} md={3} className={styles.timeSlotsContainer}>
          {onlineSchedule.slots.length === 0
            ? Array.apply(null, Array(timeSlotCount)).map((ele, index) => (
                <div
                  key={index}
                  className={`time-selection ${
                    isLoading ? 'time-selection-loading' : ''
                  }`}
                >
                  <ToggleButton
                    disabled={true}
                    onClick={() => toggleTime(index)}
                    variant="outlined"
                    selected={checkSelection(index)}
                  >
                    {moment(startTime)
                      .add(index * intervalCount, 'minutes')
                      .format('LT')}
                  </ToggleButton>
                </div>
              ))
            : onlineSchedule.slots.map((slot, index) => (
                <div
                  key={index}
                  className={`time-selection ${
                    isLoading ? 'time-selection-loading' : ''
                  }`}
                >
                  <ToggleButton
                    disabled={
                      onlineSchedule.isSelectedAppointmentEmpty ||
                      onlineSchedule.disable ||
                      (onlineSchedule.isPractitionerEmpty &&
                        !onlineSchedule.anyProvider)
                    }
                    onClick={() => handleTimeSlotClick(index)}
                    variant="outlined"
                    selected={checkSelection(index)}
                    style={
                      checkSelection(index)
                        ? {
                            backgroundColor: convertHexToRGBA(
                              onlineSchedule.officeInformation.brandColor,
                              12,
                            ),
                            color: onlineSchedule.officeInformation.brandColor,
                            borderColor:
                              onlineSchedule.officeInformation.brandColor,
                          }
                        : {}
                    }
                  >
                    {moment
                      .utc(slot.slot)
                      .tz(onlineSchedule.officeInformation.timezone)
                      .format('LT')}
                  </ToggleButton>
                </div>
              ))}
        </Grid>
      </Grid>
      <Grid container item className="justify-content-center">
        <div
          className={`${
            !checkProviderAppointmentSelection()
              ? styles.noSelectionContainer
              : styles.selectionContainer
          }`}
        >
          {!checkProviderAppointmentSelection() ? (
            <span className={styles.noProviderSelection}>
              {setRequiredFieldMessage()}
            </span>
          ) : (
            <Grid container>
              <Grid item xs={8} className={styles.appointmentInfo}>
                {onlineSchedule.anyProvider ? (
                  <div className={styles.timePractitionerName}>
                    {moment(onlineSchedule.dateTime.time).format('LT')} with Any
                    Provider
                  </div>
                ) : (
                  <div className={styles.bookingInfo}>
                    <span className={styles.timePractitionerName}>
                      {moment(onlineSchedule.dateTime.time).format('LT')} with{' '}
                      {
                        onlineSchedule.practitionerData.selectedPractitioner
                          .name
                      }
                    </span>
                    <span className={styles.practitionerType}>
                      {
                        onlineSchedule.practitionerData.selectedPractitioner
                          .type
                      }
                    </span>
                  </div>
                )}
              </Grid>
              <Grid item xs={4}>
                <Button
                  color="secondary"
                  variant="contained"
                  className="secondary-btn"
                  onClick={() => onlineSchedule.setScheduleNow(true)}
                  fullWidth
                  style={{
                    minWidth: 0,
                    backgroundColor:
                      onlineSchedule.officeInformation.brandColor,
                  }}
                >
                  Schedule Now
                </Button>
              </Grid>
            </Grid>
          )}
        </div>
      </Grid>
      <Notification />
    </Grid>
  );
});

export default CustomCalendar;
