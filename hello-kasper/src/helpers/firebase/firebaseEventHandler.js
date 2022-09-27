import { store } from "../../stores";
import PhoneNumber from "awesome-phonenumber";
import PushNotification from "../../stores/utils/PushNotification";
import { eventInitiatorId } from "./index";
import { queryClient } from "../../root.component";
import { toJS } from "mobx";

export const firebaseEventHandler = (event) => {
  const data = event.data.type ? event.data : event.data.data;
  const handler = handlers[data.type];

  if (handler) handler(data);

  console.log("FCM =>", data);
};

const handlers = {
  OFFICE_CHAT_KITTY: (data) => {
    const body = JSON.parse(data.data);
    const user = store.authentication.user || {};
    const fromUser = toJS(
      store.users.getUserByUserId({ userId: body.from_user }) || {}
    );

    if (user.user_id !== fromUser.user_id) {
      if (document.hidden) {
        PushNotification.newMessageNotification(body.message, () => {
          if (!window.location.pathname.startsWith("/dashboard/office-chat")) {
            window.location.pathname = "/dashboard/office-chat";
          }
        });
      }
    }
  },

  OFFICE_CHAT: (data) => {
    const body = JSON.parse(data.data);
    const user = store.authentication.user || {};
    const fromUser = toJS(
      store.users.getUserByUserId({ userId: body.from_user }) || {}
    );

    if (user.user_id !== fromUser.user_id) {
      PushNotification.showIncomingGroupChatNotification(
        fromUser.username,
        body.message,
        () => {
          if (!window.location.pathname.startsWith("/dashboard/office-task")) {
            window.location.pathname = "/dashboard/office-task";
          }
        }
      );
      body.direction = user.id === fromUser.user_id ? "OUT" : "IN";
      store.officeChats.appendMessageOrDiscard(body);
    }
  },

  PATIENT_FEED_CHAT: (data) => {
    let body = JSON.parse(data.data);
    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    const { unseen } = body;
    if (unseen) {
      if (unseen.globalUnseenCount) {
        // TODO update global unseen counts data
        store.patientChats.updateGlobalUnseenCounts(unseen.globalUnseenCount);
      }

      if (unseen.didUnseenCount && unseen.fromDid) {
        // TODO update count for did
        store.patientChats.updateDidUnseenCounts({
          newCount: unseen.didUnseenCount.Count,
          fromDid: unseen.fromDid,
        });
      }
    }

    const type = body.type || "newMessage";
    const handler = patientFeedChatHandlers[type];
    if (handler) handler(body);
  },

  PATIENT_LOBBY: (data) => {
    const body = JSON.parse(data.data);
    if (body.eventInitiatorId === eventInitiatorId) return;

    const handler = patientLobbyHandlers[body.action];
    if (handler) handler(body);
  },

  APPOINTMENT: (data) => {
    const body = JSON.parse(data.data);
    if (body.eventInitiatorId === eventInitiatorId) return;

    const handler = appointmentHandler[body.action];
    if (handler) handler(body);
  },

  PATIENT: (data) => {
    const body = JSON.parse(data.data);
    if (body.eventInitiatorId === eventInitiatorId) return;

    const handler = patientHandler[body.action];
    if (handler) handler(body);
  },

  VOIP_ACTIVITY_LOG: (data) => {
    const body = JSON.parse(data.data);

    if (body.globalUnseenCount) {
      // TODO update global unseen counts data
      store.patientChats.updateGlobalUnseenCounts(body.globalUnseenCount);
    }

    if (body.reload) {
      const { callLogs, voicemailLogs, faxLogs } = store.activityLogs.queryKeys;
      queryClient.invalidateQueries(callLogs);
      queryClient.invalidateQueries(voicemailLogs);
      queryClient.invalidateQueries(faxLogs);
    }
  },

  FAX_STATUS: (data) => {
    const fax = JSON.parse(data.data);
    const { error_code, error_message, status, media_uuid } = fax;
    store.fax.updateFaxLog(fax.uuid, {
      error_code,
      error_message,
      status,
      media_uuid,
    });
  },

  PDF_MERGE: (data) => {
    const body = JSON.parse(data.data);
    store.paperlessForm.handlePrintFCM(body);
  },

  USER_TASK: (data) => {
    const body = JSON.parse(data.data);

    if (body.type) {
      const handler = userTaskHandler[body.type];
      if (handler) handler(body);
    }
  },
};

const patientFeedChatHandlers = {
  // seen(body) {
  //   if (body.event_initiator_id !== eventInitiatorId)
  //     store.patientChats.handleSeenEvent(body);
  // },
  newMessage(body) {
    let patientDid = body.direction === "OUT" ? body.to_did : body.from_did;
    if (store.patientsFeed.smsUnseenOnly) {
      store.patientsFeed.setPendingUnseenSms(true);
    } else {
      store.patientChats.appendMessageOrDiscard(body, patientDid);
    }

    if (
      body.direction === "IN" &&
      ["received", "delivered"].includes(body.status)
    ) {
      const pn = PhoneNumber(patientDid);
      let phone = patientDid;
      if (pn.isValid()) {
        phone = pn.getNumber("national");
      }

      PushNotification.showIncomingTextMessageNotification(
        body.username,
        body.text,
        body.seen,
        () => {
          console.log(
            `NOTIFICATION CALLBACK: HIT IN FCM HANDLER. ${patientDid}`
          );
          if (!window.location.pathname.startsWith("/dashboard/patient-feed")) {
            window.location.pathname = "/dashboard/patient-feed";
          }
        }
      );
    }
  },
};

const patientLobbyHandlers = {
  addPatients() {
    store.lobby.addPatientsBulkCallback();
  },
  updatePatient(params) {
    store.lobby.updatePatientCallback(params);
  },
  reorderPatient() {
    store.lobby.reorderPatientCallback();
  },
  removePatient() {
    store.lobby.reorderPatientCallback();
  },
  updateLobbyStatus() {},
};

const appointmentHandler = {
  appointmentAdd(appt) {
    if (appt?.start) {
      // update calendar, if same date is selected
      store.scheduling.refreshIfCurrentDateSelected(appt?.start);

      // update patient feed, if same patient is selected
      store.patientsFeed.refreshAppointmentsIfPatientSelected(appt?.patient_id);
    }
  },
  appointmentUpdate(appt) {
    // update patient lobby board, if appt already exists on the board
    store.lobby.refreshBoardIfAppointmentExists(appt);

    if (appt?.start) {
      // update calendar, if same date is selected
      store.scheduling.refreshIfCurrentDateSelected(appt?.start);

      // update patient feed, if same patient is selected
      store.patientsFeed.refreshAppointmentsIfPatientSelected(appt?.patient_id);
    }
  },
};

const patientHandler = {
  patientAdd(_patient) {},
  patientUpdate(patient) {
    // update patient lobby, if same patient is already on the board
    store.lobby.refreshBoardIfPatientExists(patient);

    // TODO update patient feed, if same is selected on patient feed
  },
};

const userTaskHandler = {
  add(body) {
    store.tasks.handleTaskAddFCM(body);
  },
  update(body) {
    store.tasks.handleTaskUpdateFCM(body);
  },
  delete(body) {
    store.tasks.handleTaskDeleteFCM(body);
  },
};
