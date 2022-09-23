import React, { memo, useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import moment from 'moment';
import clsx from 'clsx';
import { Badge, makeStyles, IconButton } from '@material-ui/core';
import { ReactComponent as NotificationSettingIcon } from 'assets/images/notification-settings.svg';
import { ReactComponent as BubbleChatIcon } from 'assets/images/bubbleChat.svg';
import { useStores } from 'hooks/useStores';
import { useOfficeChatState } from 'hooks/useOfficeChatState';
import { useOfficeChatDispatch } from 'hooks/useOfficeChatDispatch';
import NotificationSettingsModal from '../NotificationSettingsModal/index';
import styles from './index.module.css';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  customBadge: () => ({
    backgroundColor: '#FEA828',
    color: '#FEA828',
    height: '10px !important',
    width: '10px !important',
    borderRadius: '17px !important',
    top: '-10.6px',
    left: '-19px',
  }),
}));

function NotificationSettings(props) {
  const classes = useStyles(props);
  const { isActiveBubbleChat } = useOfficeChatState();
  const { toggleBubbleChat } = useOfficeChatDispatch();

  const { notificationSetting, authentication, notification } = useStores();
  const [showNotificationSetting, setShowNotificationSetting] = useState(false);
  const { user_id } = authentication.user;
  const queryClient = useQueryClient();
  const toggleBubble = () => {
    toggleBubbleChat(!isActiveBubbleChat);
  };
  const { data, isSuccess } = useQuery(
    ['notificationFetchData'],
    () => {
      return notificationSetting.fetchNotificationData(user_id);
    },
    {
      onSuccess: (data) => {
        if (
          data?.incoming_call_ring === 1 &&
          data?.incoming_call_popup === 1 &&
          data?.sms_sound === 1 &&
          data?.sms_popup === 1 &&
          data?.mute_all_sounds === 0 &&
          data?.mute_all_popup === 0 &&
          data?.ready_for_doc_sound === 1 &&
          data?.ready_for_doc_popup === 1
        ) {
          notificationSetting.showDotIcon = false;
        } else {
          notificationSetting.showDotIcon = true;
        }
      },
    },
  );

  const { mutateAsync: updateNotificationsData } = useMutation(
    'updateNotificationData',
    (updateNotifyData) => {
      return notificationSetting.updateNotificationData(
        updateNotifyData,
        false,
      );
    },
    {
      onError: (error) => {
        notification.showError(
          'An unexpected error occurred while attempting to update notification data',
        );
      },
      onSettled: () => queryClient.refetchQueries('notificationFetchData'),
    },
  );

  const updateNotificationHandler = (endTime, type) => {
    const currentTime = moment().format('yyyy-MM-DD HH:mm:ss');
    if (currentTime > endTime) {
      let payload = {
        user_id: user_id,
      };
      if (type === 'mute_all_sound') {
        payload.mute_all_sound = false;
      } else {
        payload.mute_all_popup = false;
      }
      updateNotificationsData(payload);
    }
  };

  const getIntervalTime = (endTime) => {
    const now = moment(new Date()); //todays date
    const end = moment(endTime); // another date
    const duration = moment.duration(end.diff(now));
    const minutes = duration.asMinutes();
    let intervalTime =
      minutes <= 30
        ? 60000
        : minutes > 30 && minutes <= 120
        ? 120000
        : minutes > 120 && minutes <= 240
        ? 180000
        : minutes > 240
        ? 300000
        : 60000;
    return intervalTime;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (notificationSetting.notifyData) {
      if (
        notificationSetting.notifyData.mute_all_sounds === 1 &&
        notificationSetting.notifyData.sound_end_time !== 'indefinitely'
      ) {
        updateNotificationHandler(
          notificationSetting.notifyData.sound_end_time,
          'mute_all_sound',
        );
        if (notificationSetting.notificationIntervalId === null) {
          let intervalTime = getIntervalTime(
            notificationSetting.notifyData.sound_end_time,
          );
          const id = setInterval(() => {
            updateNotificationHandler(
              notificationSetting.notifyData.sound_end_time,
              'mute_all_sound',
            );
          }, intervalTime);
          notificationSetting.notificationIntervalId = id;
        }
      }

      if (
        notificationSetting.notifyData.mute_all_popup === 1 &&
        notificationSetting.notifyData.popup_end_time !== 'indefinitely'
      ) {
        updateNotificationHandler(
          notificationSetting.notifyData.popup_end_time,
          'mute_all_popup',
        );
        if (notificationSetting.notificationIntervalPopupId === null) {
          let intervalPopTime = getIntervalTime(
            notificationSetting.notifyData.popup_end_time,
          );
          const popId = setInterval(() => {
            updateNotificationHandler(
              notificationSetting.notifyData.popup_end_time,
              'mute_all_popup',
            );
          }, intervalPopTime);
          notificationSetting.notificationIntervalPopupId = popId;
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationSetting.notifyData]);

  return (
    <>
      <div
        className={styles.wrapper}
        onClick={() => setShowNotificationSetting(true)}
      >
        <NotificationSettingIcon className={styles.icon} />
        {notificationSetting.showDotIcon && (
          <Badge variant="dot" classes={{ badge: classes.customBadge }} />
        )}
      </div>
      <IconButton
        className={clsx(styles.iconBubbleButton, {
          [styles.iconBubbleButtonActive]: isActiveBubbleChat,
        })}
        onClick={toggleBubble}
      >
        <BubbleChatIcon />
      </IconButton>
      {showNotificationSetting === true && (
        <NotificationSettingsModal
          onClose={() => setShowNotificationSetting(false)}
        />
      )}
    </>
  );
}

export default memo(NotificationSettings);
