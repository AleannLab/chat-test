import firebase from "firebase";
import { guidGenerator } from "../misc";

let messaging: any;

export const eventInitiatorId = guidGenerator();

export const getFcmToken = async () => {
  if (firebase.messaging.isSupported()) {
    messaging = firebase.messaging();
  }
  try {
    if (!firebase.messaging.isSupported() || !("Notification" in window)) {
      // store.notification.showError(
      //   'This browser does not support desktop notifications',
      // );
      return null;
    }

    if (Notification.permission === "granted") {
      let token = await messaging.getToken();
      return token;
    }
  } catch (e) {
    console.log(e);
  }
  return null;
};
