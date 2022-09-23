import React, { useState, useEffect } from 'react';
import Modal from 'components/Core/Modal';
import Switch from 'components/Core/Switch';
import { useStores } from 'hooks/useStores';
import { Message, Call, LocalHospital } from '@material-ui/icons';
import moment from 'moment';
import NotificationWarning from './NotificationWarning/index';
import NotificationSettingAccordion from './NotificationSettingAccordion/index';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import VisibilityIcon from '@material-ui/icons/Visibility';
import styles from './index.module.css';
import Button from '@material-ui/core/Button';
import PushNotification from 'stores/utils/PushNotification';
import { Formik, Form } from 'formik';
import ReadyForDoctorAudio from 'assets/sounds/ready-for-doctor.mp3';

const LABELS = {
  IncomingCallRinging: {
    label: 'Incoming call ringing sound (web phone)',
    key: 'incoming_call_ring',
  },
  IncomingCallPopUp: {
    label: 'Incoming call browser notification (web phone)',
    key: 'incoming_call_popup',
  },
  IncomingSMS_Sound: { label: 'Incoming SMS sound', key: 'sms_sound' },
  IncomingSMS_BrowserPopUps: {
    label: 'Incoming SMS browser notification pop-ups',
    key: 'sms_popup',
  },
  ReadyForDoc_Sound: {
    label: 'Ready for Doctor sound',
    key: 'ready_for_doc_sound',
  },
  ReadyForDoc_BrowserPopUps: {
    label: 'Ready for Doctor browser notification pop-ups',
    key: 'ready_for_doc_popup',
  },
  // IncomingVoicemailSound: 'Incoming voicemail sound',
  // VoicemailReceivedBrowserPopUps: 'Incoming Voicemail browser notification',
  // IncomingFaxSound: 'Incoming fax sound',
  // IncomingFaxBrowserPopUps: 'Incoming fax browser notification',
};

const ACCORDION_LABEL = {
  panel1: {
    label: 'Mute all sounds',
    key: 'mute_all_sounds',
    radioGroupName: 'sounds_time',
  },
  panel2: {
    label: 'Mute all pop-ups',
    key: 'mute_all_popup',
    radioGroupName: 'popup_time',
  },
};

const TIME_INTERVALS = {
  firstTime: '30 min',
  secondTime: '1 hour',
  thirdTime: '2 hours',
  fourthTime: '4 hours',
  fifthTime: 'Rest of the day',
  sixthTime: 'indefinitely',
};

const useStyles = makeStyles(() => ({
  icon: {
    fontSize: '14px',
    marginRight: '10px',
    color: () => '#9A9A9A',
    '& path': {
      fill: () => '#9A9A9A',
    },
  },
  IconButtonPadding: {
    '&.MuiIconButton-root': {
      padding: '0px',
    },
  },
}));

const NotificationSettingsModal = ({ onClose }) => {
  const classes = useStyles();
  const { notificationSetting, authentication, notification } = useStores();
  const queryClient = useQueryClient();
  const [showNotificationStrip, setShowNotificationStrip] = useState(false);
  const [remainingTimePanel1, setRemainingTimePanel1] = useState('');
  const [remainingTimePanel2, setRemainingTimePanel2] = useState('');
  const [initialValues, setInitialValues] = useState({});

  const { user_id, timezone } = authentication.user;

  const notifyDataWrapper = [
    {
      id: 0,
      icon: <Call className={styles.icons} />,
      label: LABELS.IncomingCallRinging.label,
      switch_name: LABELS.IncomingCallRinging.key,
      preview: false,
    },
    {
      id: 1,
      icon: <Call className={styles.icons} />,
      label: LABELS.IncomingCallPopUp.label,
      switch_name: LABELS.IncomingCallPopUp.key,
      preview: true,
    },
    {
      id: 2,
      icon: <Message className={styles.icons} />,
      label: LABELS.IncomingSMS_Sound.label,
      switch_name: LABELS.IncomingSMS_Sound.key,
      preview: false,
    },
    {
      id: 3,
      icon: <Message className={styles.icons} />,
      label: LABELS.IncomingSMS_BrowserPopUps.label,
      switch_name: LABELS.IncomingSMS_BrowserPopUps.key,
      preview: true,
    },
    // {
    //   id: 4,
    //   icon: <Voicemail className={styles.icons} />,
    //   name: state.VoicemailReceivedBrowserPopUps,
    //   checked: data?.voicemail_popup === 1 ? true : false,
    //   switch_name: 'voicemail_popup',
    // },
    // {
    //   id: 5,
    //   icon: <FaxIcon className={classes.icon} />,
    //   name: state.IncomingFaxBrowserPopUps,
    //   checked: data?.fax_popup === 1 ? true : false,
    //   switch_name: 'fax_popup',
    // },
    {
      id: 6,
      icon: <LocalHospital className={styles.icons} />,
      label: LABELS.ReadyForDoc_Sound.label,
      switch_name: LABELS.ReadyForDoc_Sound.key,
      preview: false,
    },
    {
      id: 7,
      icon: <LocalHospital className={styles.icons} />,
      label: LABELS.ReadyForDoc_BrowserPopUps.label,
      switch_name: LABELS.ReadyForDoc_BrowserPopUps.key,
      preview: true,
    },
  ];

  const { data, isLoading: isLoadingSettings } = useQuery(
    ['notificationFetchData'],
    () => notificationSetting.fetchNotificationData(user_id),
    {
      onError: (err) => {
        notification.showError(
          err.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch notification data',
        );
      },
    },
  );

  const getEndTimeOfSoundAndPopUp = (updatedSoundTime, previousSoundTime) => {
    let soundStartTime =
      updatedSoundTime === previousSoundTime ? undefined : moment().format();
    let soundTime = updatedSoundTime;
    let timeValue = 0;
    let timeType = 'seconds';
    if (soundStartTime) {
      if (soundTime === TIME_INTERVALS.fifthTime) {
        soundStartTime = moment(soundStartTime)
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        let numericTimeValue = parseInt(soundTime);
        if (!isNaN(numericTimeValue)) {
          timeValue = numericTimeValue;
          if (soundTime.includes('min')) {
            timeType = 'minutes';
          } else if (soundTime.includes('hour')) {
            timeType = 'hours';
          }
        }
      }
    }
    const convertedDate = soundStartTime
      ? soundTime != TIME_INTERVALS.sixthTime
        ? moment
            .tz(moment(soundStartTime).format('YYYY-MM-DD HH:mm:ss'), timezone)
            .format('YYYY-MM-DD HH:mm:ss')
        : TIME_INTERVALS.sixthTime
      : null;
    return convertedDate != null
      ? convertedDate != TIME_INTERVALS.sixthTime
        ? soundTime != TIME_INTERVALS.fifthTime
          ? moment(convertedDate)
              .add(timeValue, timeType)
              .format('yyyy-MM-DD HH:mm:ss')
          : convertedDate
        : TIME_INTERVALS.sixthTime
      : null;
  };

  const {
    mutate: updateNotificationsData,
    isLoading: isUpdating,
    data: result,
  } = useMutation(
    (updateNotifyData) => {
      // for mute all sound
      const soundEndTime = getEndTimeOfSoundAndPopUp(
        updateNotifyData.sounds_time,
        data.sounds_time,
      );
      // for mute all popup
      const popupEndTime = getEndTimeOfSoundAndPopUp(
        updateNotifyData.popup_time,
        data.popup_time,
      );

      const updateNotifyPayload = {
        incoming_call_Popup: updateNotifyData.incoming_call_popup,
        incoming_call_ring: updateNotifyData.incoming_call_ring,
        mute_all_popup: updateNotifyData.mute_all_popup,
        mute_all_sound: updateNotifyData.mute_all_sounds,
        sms_popup: updateNotifyData.sms_popup,
        sms_sound: updateNotifyData.sms_sound,
        sound_end_time: soundEndTime,
        sound_time:
          updateNotifyData.sounds_time === null
            ? undefined
            : updateNotifyData.sounds_time,
        popup_end_time: popupEndTime,
        popup_time:
          updateNotifyData.popup_time === null
            ? undefined
            : updateNotifyData.popup_time,
        user_id: user_id,
        ready_for_doc_sound: updateNotifyData.ready_for_doc_sound,
        ready_for_doc_popup: updateNotifyData.ready_for_doc_popup,
      };
      return notificationSetting.updateNotificationData(updateNotifyPayload);
    },
    {
      onMutate: (variables) => {
        queryClient.cancelQueries('notificationFetchData');
        queryClient.setQueryData('notificationFetchData', (newData) => ({
          ...newData,
          ...variables,
        }));
        return queryClient.getQueryData('notificationFetchData', variables);
      },
      onSuccess: (data, variables) => {
        queryClient.setQueryData(['notificationFetchData'], (oldData) => ({
          ...oldData,
          ...variables,
        }));
      },
      onError: (error) => {
        notification.showError(
          error.DetailedMessage ||
            'An unexpected error occurred while attempting to update notification data',
        );
      },
      onSettled: () => queryClient.refetchQueries('notificationFetchData'),
    },
  );

  const remainingTimeConversionHandler = (sound_end_time) => {
    const now = moment(new Date()); //todays date
    const end = moment(sound_end_time); // another date
    const duration = moment.duration(end.diff(now));
    return duration.asMilliseconds();
  };

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted') {
        setShowNotificationStrip(true);
      }
    }
    // remainingTime for mute all sound
    if (data && data.mute_all_sounds === 1 && data.sound_end_time != null) {
      const soundTimeFormat =
        data.sounds_time === TIME_INTERVALS.sixthTime
          ? TIME_INTERVALS.sixthTime
          : remainingTimeConversionHandler(data.sound_end_time);
      setRemainingTimePanel1(soundTimeFormat);
    } else {
      setRemainingTimePanel1('');
    }
    // remainingTime for mute all popup
    if (data && data.mute_all_popup === 1 && data.popup_end_time != null) {
      const popupTimeFormat =
        data.popup_time === TIME_INTERVALS.sixthTime
          ? TIME_INTERVALS.sixthTime
          : remainingTimeConversionHandler(data.popup_end_time);
      setRemainingTimePanel2(popupTimeFormat);
    } else {
      setRemainingTimePanel2('');
    }

    const initialValues = {
      incoming_call_ring: !!data?.incoming_call_ring ?? false,
      incoming_call_popup: !!data?.incoming_call_popup ?? false,
      sms_sound: !!data?.sms_sound ?? false,
      sms_popup: !!data?.sms_popup ?? false,
      mute_all_sounds: !!data?.mute_all_sounds ?? false,
      mute_all_popup: !!data?.mute_all_popup ?? false,
      sounds_time: data?.sounds_time ?? null,
      sound_end_time: data?.sound_end_time ?? moment().format(),
      popup_time: data?.popup_time ?? null,
      popup_end_time: data?.popup_end_time ?? moment().format(),
      ready_for_doc_sound: !!data?.ready_for_doc_sound ?? false,
      ready_for_doc_popup: !!data?.ready_for_doc_popup ?? false,
    };
    setInitialValues(initialValues);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleClose = () => {
    onClose();
  };

  const handleChangeTestNotification = (type) => {
    const notificationType = 'test';
    const fromNumber = 'Kasper';
    if (type === LABELS.IncomingCallPopUp.key) {
      PushNotification.showIncomingCallNotification(
        fromNumber,
        notificationType,
      );
    } else if (type === LABELS.IncomingSMS_BrowserPopUps.key) {
      const message = 'This is a test notification for Incoming SMS!';
      PushNotification.showIncomingTextMessageNotification(
        fromNumber,
        message,
        undefined,
        notificationType,
      );
    } else if (type === LABELS.ReadyForDoc_BrowserPopUps.key) {
      PushNotification.showReadyForDoctorNotification('John Doe', () => {
        const audio = new Audio(ReadyForDoctorAudio);
        audio.play();
      });
    }
  };

  const isLoading = isLoadingSettings || isUpdating;

  const changeRadioValue = (muteAllValue, setFieldValue, type) => {
    setFieldValue(
      type === ACCORDION_LABEL.panel1.key ? 'sounds_time' : 'popup_time',
      muteAllValue === false ? null : TIME_INTERVALS.sixthTime,
    );
  };

  const changeMuteAllSoundPopup = (values, setFieldValue, type) => {
    if (
      type === ACCORDION_LABEL.panel1.radioGroupName &&
      values.mute_all_sounds === false
    ) {
      setFieldValue(ACCORDION_LABEL.panel1.key, true);
    } else if (
      type === ACCORDION_LABEL.panel2.radioGroupName &&
      values.mute_all_popup === false
    ) {
      setFieldValue(ACCORDION_LABEL.panel2.key, true);
    }
  };
  return (
    <Modal
      allowClosing={!isLoading}
      size="sm"
      header={'Notification Settings'}
      enableMargin={false}
      body={
        <Formik
          initialValues={initialValues}
          onSubmit={updateNotificationsData}
          enableReinitialize
        >
          {({ values, handleChange, setFieldValue }) => {
            console.log({ values });
            return (
              <Form>
                <div className={styles.notifyWrapper}>
                  {showNotificationStrip && <NotificationWarning />}
                  {notifyDataWrapper.map((notifyData) => (
                    <div className={styles.form} key={notifyData.id}>
                      <div className={styles.form_control}>
                        {notifyData.icon}
                        <span className={styles.text}>{notifyData.label}</span>
                      </div>
                      <span className="d-flex align-items-center">
                        {notifyData.preview === true && (
                          <span className="me-3">
                            <IconButton className={classes.IconButtonPadding}>
                              <VisibilityIcon
                                style={{ color: '#9a9a9a', fontSize: '1.7rem' }}
                                onClick={() =>
                                  handleChangeTestNotification(
                                    notifyData.switch_name,
                                  )
                                }
                              />
                            </IconButton>
                          </span>
                        )}
                        <Switch
                          disabled={isLoading}
                          checked={values[notifyData.switch_name]}
                          className={styles.switch}
                          name={notifyData.switch_name}
                          onChange={handleChange}
                        />
                      </span>
                    </div>
                  ))}
                </div>
                <hr />
                <div className={`${styles.notifyWrapper1}`}>
                  {Object.entries(ACCORDION_LABEL).map((item, index) => (
                    <div
                      className={`${
                        index === 0
                          ? styles.notification_popup1
                          : styles.notification_popup
                      } w-100`}
                      key={index}
                    >
                      <NotificationSettingAccordion
                        notificationData={{
                          isLoading,
                          values,
                          handleChange,
                          setFieldValue,
                          changeMuteAllSoundPopup,
                          changeRadioValue,
                          TIME_INTERVALS,
                          switchLabel: item[1].label,
                          switchKey: item[1].key,
                          radioKey: item[1].radioGroupName,
                          remainingTime:
                            index === 0
                              ? remainingTimePanel1
                              : remainingTimePanel2,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className={`${styles.notifyWrapper} ${styles.marginTop15} d-flex justify-content-between`}
                >
                  <Button
                    disabled={isLoading}
                    type="reset"
                    className="primary-btn me-auto"
                    variant="outlined"
                    color="primary"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="secondary-btn"
                    variant="contained"
                    color="secondary"
                    disabled={isLoading}
                  >
                    {isUpdating ? 'Saving' : 'Save'}
                  </Button>
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

export default NotificationSettingsModal;
