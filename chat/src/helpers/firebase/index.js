import firebase from 'firebase';
import { INSTANCE_TOKEN, firebaseConfig } from './config';
import { store } from 'stores';
import { guidGenerator } from 'helpers/misc';
import { firebaseEventHandler } from './firebaseEventHandler';

let messaging;

export const eventInitiatorId = guidGenerator();

export const firebaseInitialize = () => {
  firebase.initializeApp(firebaseConfig);

  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function (event) {
      console.log('event listener', event);
      firebaseEventHandler(event);
    });
  }

  setupFirebaseMessaging();
};

export const getFcmToken = async () => {
  try {
    if (!firebase.messaging.isSupported() || !('Notification' in window)) {
      // store.notification.showError(
      //   'This browser does not support desktop notifications',
      // );
      return null;
    }

    if (Notification.permission === 'granted') {
      let token = await messaging.getToken();
      return token;
    }
  } catch (e) {
    console.log(e);
  }
  return null;
};

const setupFirebaseMessaging = () => {
  requestNotificationPermission().then(async ({ granted, token }) => {
    if (granted === true) {
      console.log(`token: ${token}`);
      console.log(
        'user for subscribe',
        store.authentication.authenticatedData,
        await getFcmToken(),
      );
      if (
        store.authentication.loadedAuth === true &&
        store.authentication.authenticatedData
      ) {
        store.users
          .notificationSubscribe({})
          .then((res) => console.log('subscribed'));
      }

      // messaging.onMessage((payload) => {
      //   console.log('Message received. ', payload);
      // });
    }
  });
};

const requestNotificationPermission = async () => {
  let permissionGranted = false;
  let token;
  try {
    if (!firebase.messaging.isSupported() || !('Notification' in window)) {
      // store.notification.showError(
      //   'This browser does not support desktop notifications',
      // );
      return false;
    }

    /* request permission if not granted */
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      token = await messaging.getToken();
      localStorage.setItem(INSTANCE_TOKEN, token);
      permissionGranted = true;
    }
  } catch (err) {
    console.log(err);
    if (
      err.hasOwnProperty('code') &&
      err.code === 'messaging/permission-default'
    )
      console.log('You need to allow the site to send notifications');
    else if (
      err.hasOwnProperty('code') &&
      err.code === 'messaging/permission-blocked'
    )
      console.log(
        'Currently, the site is blocked from sending notifications. Please unblock notifications in your browser settings',
      );
    else console.log('Unable to subscribe you to notifications');
  }

  return {
    token,
    granted: permissionGranted,
  };
};
