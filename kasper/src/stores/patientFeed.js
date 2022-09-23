import { SingleSelectableResource } from './utils/SingleSelectableResource';
import { flow, observable, action } from 'mobx';
import { NOT_LOADED } from 'helpers/loadstates';
import { createTransformer } from 'mobx-utils';
import { groupBy as _groupby } from 'lodash';
import { serializeToQueryString } from 'helpers/misc';
import PhoneNumber from 'awesome-phonenumber';
import { generateColor } from 'helpers/misc';
import CONSTANTS from 'helpers/constants';
import { convertCustomTime } from 'helpers/timezone';
import { queryClient } from 'App';

export class PatientFeed extends SingleSelectableResource {
  @observable isNewSMS = false;
  @observable newSMSPhoneNumber = null;
  @observable chatsLoading = false;
  @observable chatsLoaded = false;
  @observable patientSearch = '';
  @observable notificationAlert = true;
  @observable smsUnseenOnly = false;
  @observable pendingUnseenSms = false;

  /**
   * Used for setting offset as well as number of records or rows to fetch
   */
  NUM_RECORDS = 50;

  @observable selectedPatient = null;

  @action
  setSelectedPatient(value) {
    this.selectedPatient = value;
  }

  @action
  setPatientSearch(val) {
    this.patientSearch = val;
  }

  @action
  setNotificationAlert(val) {
    this.notificationAlert = val;
  }

  @action
  setSmsUnseenOnly(val) {
    this.smsUnseenOnly = val;
  }

  @action
  setPendingUnseenSms(val) {
    this.pendingUnseenSms = val;
  }

  constructor(stores) {
    super(stores);
    this.stores = stores;
    this.initSubResources();
  }

  initSubResources() {
    this.registerSubResource(
      { resourceNamePlural: 'tasks' },
      {
        fetchList: this.listTasksApiHandler, //exposes this.patients.fetchTasks()
      },
    );
    this.registerSubResource(
      { resourceNamePlural: 'appointments' },
      {
        fetchList: this.listAppointmentsApiHandler, //exposes this.patients.fetchAppointments()
      },
    );
  }

  listMapper = (newData, oldData, _index, _results) => {
    let payload = {
      ...(oldData ? oldData : {}),
      ...(newData ? newData : {}),
      __tasks_sync: NOT_LOADED,
      tasks: [],
      __appointments_sync: NOT_LOADED,
      appointments: [],
      __chats_sync: NOT_LOADED,
      chats: [],
      displayName:
        newData.firstname || newData.lastname
          ? `${newData.firstname} ${newData.lastname}`
          : newData.email,
      profilePicColor: generateColor(newData.id),
    };

    if (_index === 0 && !this.selected) {
      payload.__isSelected = true;
      this.selected = newData.id;
    }

    return payload;
  };

  listTasksApiHandler = async ({ id }) => {
    try {
      return await this.stores.tasks.listApiHandler({
        withCategories: true,
        patient: id,
      });
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to fetch the tasks',
      );
    }
  };

  // listAppointmentsApiHandler({ id: patientId }) {
  //   return this.fetch(`${CONSTANTS.OFFICE_API_URL}/appointments`)
  //     .then((response) => response.json())
  //     .then((r) => r.data.slice(0, 10));
  // }

  listAppointmentsApiHandler = async ({ id }) => {
    try {
      return await this.stores.appointments.listApiHandler({
        patientId: id,
        futureOnly: true,
      });
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to fetch the appointments',
      );
    }
  };

  async fetchPatientAppointments(id, futureOnly = true) {
    try {
      let params = {
        patientId: id,
        futureOnly,
        withProcedures: true,
      };
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointments${serializeToQueryString(
          params,
        )}`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpectedd error occurred while attempting to fetch the appointments',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpectedd error occurred while attempting to fetch the appointments',
      );
    }
  }

  listApiHandler = async (params) => {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/patients${serializeToQueryString(params)}`,
    ).then((r) => r.json());

    if (!response.success) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the patients',
      );
    }

    return response.data;
  };

  getApiHandler = async (id) => {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    // patientInfo.chats = chats;
    return patientInfo;
  };

  formattedPatientChats = createTransformer(({ id: patientId }) => {
    // const { timezone } = this.authentication.user || {};
    const chats = this.store.chats;
    let combinationId = 0;
    const patientChats = this.get([[], patientId, 'chats']);
    const chatsToProcess = [...patientChats];
    let dateCounter = convertCustomTime({
      dateTime: chats.get([{}, chatsToProcess[0]]).datetime,
      shouldFormat: false,
    }).startOf('day');
    let formattedChat = [];
    chatsToProcess.forEach((chatId, index) => {
      const chat = chats.get([null, chatId]);

      const previousChat = chats.get([null, chatsToProcess[index - 1]]);
      if (!chat) return;
      if (index === 0) {
        return formattedChat.push({
          type: 'CHAT',
          ...chat,
          combinationId,
        });
      }

      if (
        !convertCustomTime({ dateTime: chat.datetime, shouldFormat: false })
          .startOf('day')
          .isSame(dateCounter)
      ) {
        combinationId = combinationId + 1;
        formattedChat.push({
          type: 'DATE',
          date: convertCustomTime({
            dateTime: chat.datetime,
            shouldFormat: false,
          }),
          combinationId,
        });
        combinationId = combinationId + 1;
        dateCounter = convertCustomTime({
          dateTime: chat.datetime,
          shouldFormat: false,
        }).startOf('day');
      }

      if (
        chat.username !== previousChat.username ||
        convertCustomTime({
          dateTime: chat.datetime,
          shouldFormat: false,
        }).diff(previousChat.datetime, 'minutes') > 1 ||
        previousChat.direction !== chat.direction
      ) {
        combinationId = combinationId + 1;
      }

      formattedChat.push({
        type: 'CHAT',
        ...chat,
        combinationId,
      });
    });

    return Object.values(_groupby(formattedChat, 'combinationId'));
  });

  getPatientByPhoneNumberAction = flow(function* ({ phoneNo }) {
    const patient = yield this._getPatientByPhoneNumberApiHandler({
      phoneNo,
    });
    if (patient) this.datum[patient.id] = patient;
  });

  async _getPatientByPhoneNumberApiHandler({ phoneNo }) {
    let result = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/patients/phoneNo/${phoneNo}`,
    ).then((response) => response.json());
    return result.data;
  }

  getPatientByPhoneNumber = createTransformer(({ phoneNo }) => {
    let patient = Object.values(this.datum).find(
      (p) => p.phone_no && p.phone_no.endsWith(phoneNo),
    );
    if (patient.is_patient === 1)
      return `${patient.firstname} ${patient.lastname}`;

    var phone = PhoneNumber(phoneNo);
    return phone ? phone.getNumber('national') : phoneNo;
  });

  getPatientInfoByPhoneNumber = createTransformer(({ phoneNo }) => {
    return Object.values(this.datum).find(
      (p) => p.phone_no && p.phone_no.endsWith(phoneNo),
    );
  });

  getPatientAsTags = createTransformer((_params) => {
    let patients = Object.values(this.datum).map((patient) => ({
      id: patient.id,
      name: `${patient.firstname} ${patient.lastname}`,
    }));
    return patients;
  });

  sendMessage = flow(function* (message) {
    try {
      yield this._sendChatMessageApiHandler({
        to_did: this.isNewSMS
          ? this.newSMSPhoneNumber
          : this.datum[this.selected].phone_no,
        text: message,
      });
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to send the message',
      );
    }
  });

  async _sendChatMessageApiHandler({ to_did, text }) {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    var raw = JSON.stringify({ to_did: to_did, text: text });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    const response = await this.fetch(
      `${CONSTANTS.VOIP_API_URL}/text-messages`,
      requestOptions,
    ).then((res) => res.json());
    if (response.uuid) {
      return response;
    } else {
      throw Error(
        'An unexpected error occurred while attempting to send the message',
      );
    }
  }

  @action.bound
  setIsNewSMS = (isNewSMS) => {
    if (isNewSMS) {
      this.setSelectedPatient({});
    }
    this.isNewSMS = isNewSMS;
  };

  @action.bound
  setNewSMSPhoneNumber = (phoneNumber) => {
    this.newSMSPhoneNumber = phoneNumber;
  };

  @observable isRefetching = false;

  async refetchPatientFeed() {
    this.isRefetching = true;
    await queryClient.refetchQueries(['patientFeed'], { active: true });
    this.isRefetching = false;
  }

  async fetchPatientForms(patientId) {
    const response = await this.fetch(
      `${CONSTANTS.FORMS_API_URL}/invitations/forms-status/${patientId}`,
    ).then((r) => r.json());

    if (!response.success) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the form status',
      );
    } else {
      return response.data;
    }
  }

  async refreshAppointmentsIfPatientSelected(patient_id) {
    if (patient_id && this.selectedPatient?.id == patient_id) {
      queryClient.refetchQueries([
        'fetchAppointments',
        this.selectedPatient && this.selectedPatient.id,
      ]);
    }
  }
}
