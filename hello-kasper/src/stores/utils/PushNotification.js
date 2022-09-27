// import IncomingMessageAudio from '../../assets/sounds/incoming_message.wav';
import { store } from '../../stores';
import { useFlags } from 'launchdarkly-react-client-sdk';

const notify = (config, callback) => {
  // Check for notification compatibility.
  if (!('Notification' in window)) {
    // If the browser version is unsupported, remain silent.
    return;
  }

  // If the user has not been asked to grant or deny notifications for this domain
  if (Notification.permission === 'default') {
    Notification.requestPermission(function () {
      // ...callback this function once a permission level has been set.
      notify();
    });
  }
  // If the user has granted permission for this domain to send notifications...
  else if (Notification.permission === 'granted') {
    const {
      title = 'Notification from Kasper App',
      body = '',
      icon = '/favicon.ico',
    } = config;

    var notification = new Notification(title, { body, icon });

    // Remove the notification from Notification Center when clicked.
    notification.onclick = function (e) {
      window.focus();
      this.close();
      if (callback) callback();
    };

    // Working on localhost on Firefox, but not on Chrome
    notification.addEventListener('close', () => {
      if (callback) {
        callback();
      }
    });

    // TODO: Check why this is not at all working but addEventListener is working for some browsers

    // Callback function when the notification is closed.
    // notification.onclose = function () {
    //   // console.log('Notification closed');
    // };
  }
  // If the user does not want notifications to come from this domain...
  else if (Notification.permission === 'denied') {
    // ...remain silent.
  }
};

const PushNotification = {
  showIncomingCallNotification: (fromNumber, type) => {
    const notifyStore = store.notificationSetting;
    const { incoming_call_popup, mute_all_popup, incoming_call_ring } = {
      ...notifyStore.notifyData,
    };
    if (type == 'test' || (incoming_call_popup && !mute_all_popup)) {
      notify({
        title:
          type == 'test'
            ? 'This is a test notification for Incoming Call!'
            : 'New incoming call',
        body: `From: ${fromNumber}`,
        icon: '/favicon.ico',
      });
    }
  },
  showIncomingTextMessageNotification: (
    username,
    message,
    seen,
    callback,
    type,
  ) => {
    const notifyStore = store.notificationSetting;
    const { sms_sound, sms_popup, mute_all_popup, mute_all_sounds } = {
      ...notifyStore.notifyData,
    };
    if ((sms_sound && !mute_all_sounds) || type == 'test') {
      const audio = new Audio();
      audio.play();
    }

    if ((sms_popup && !mute_all_popup && !seen) || type == 'test') {
      notify(
        {
          title: `Message from ${username}`,
          body: `New SMS Received`,
          icon: '/favicon.ico',
        },
        callback,
      );
    }
  },
  showIncomingGroupChatNotification: (from, message, callback, type) => {
    const notifyStore = store.notificationSetting;
    const { mute_all_sounds, mute_all_popup } = {
      ...notifyStore.notifyData,
    };
    if (!mute_all_sounds) {
      const audio = new Audio(IncomingMessageAudio);
      audio.play();
    }

    if (!mute_all_popup) {
      notify(
        {
          title: `💬 Office Group - ${from} `,
          body: `${message}`,
          icon: '/favicon.ico',
        },
        callback,
      );
    }
  },
  showReadyForDoctorNotification: (patientName, playAudio) => {
    const notifyStore = store.notificationSetting;
    const {
      mute_all_popup,
      mute_all_sounds,
      ready_for_doc_sound,
      ready_for_doc_popup,
    } = {
      ...notifyStore.notifyData,
    };

    if (!mute_all_popup && ready_for_doc_popup) {
      notify({
        title: 'Message from lobby',
        body: `${patientName} is ready for the doctor.`,
      });
    }
    if (playAudio && !mute_all_sounds && ready_for_doc_sound) {
      playAudio();
    }
  },
  showWaitingForDoctorNotification: (patientName, duration) => {
    const notifyStore = store.notificationSetting;
    const { mute_all_popup } = { ...notifyStore.notifyData };
    if (!mute_all_popup) {
      notify({
        title: 'Message from lobby',
        body: `ALERT! ${patientName} has been waiting for over ${duration} minutes!`,
      });
    }
  },

  newMessageNotification: (message, callback) => {
    const notifyStore = store.notificationSetting;
    const { mute_all_popup } = { ...notifyStore.notifyData };
    if (!mute_all_popup) {
      notify(
        {
          title: 'New office message',
          body: message,
        },
        callback,
      );
    }
  },
};

export default PushNotification;
