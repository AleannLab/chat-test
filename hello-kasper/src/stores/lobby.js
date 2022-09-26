import Resource from './utils/resource';
import { createTransformer } from 'mobx-utils';
import { serializeToQueryString } from 'helpers/misc';
import { action, observable, flow } from 'mobx';
import CONSTANTS, { DASHBOARD_SUB_STATE } from 'helpers/constants';
import moment from 'moment-timezone';
import { eventInitiatorId } from 'helpers/firebase';
import PushNotification from 'stores/utils/PushNotification';
import ReadyForDoctorAudio from 'assets/sounds/ready-for-doctor.mp3';
import TimeExceededAudio from 'assets/sounds/time-exceeded.wav';

export class Lobby extends Resource {
  @observable boardData = [];
  @observable readyForDoctor = new Map();
  @observable patientNotificationInfo = new Map();
  ATTENTION_WAIT_TIME_IN_MINUTES = 10;

  constructor(store) {
    super(store);
    this.store = store;
  }

  @action
  initializePatientNotificationInfo() {
    this.patientNotificationInfo.clear();
    this.data.forEach((id) => {
      const patient = this.get([{}, id]);
      if (patient.ready_for_doctor_at) {
        const startTime = moment.utc(patient.ready_for_doctor_at);
        const endTime = moment.utc();
        const duration = moment.duration(
          endTime.diff(startTime),
          'milliseconds',
        );
        this.patientNotificationInfo.set(id, {
          timeInMilliseconds: duration.asMilliseconds(),
          waitedTimeInMilliseconds: null,
        });

        /**
         * Begin counting time in background for each patient who is ready for doctor
         */
        this.handleUserNotification({
          patient,
          duration: duration.asMilliseconds(),
        });
      } else {
        this.patientNotificationInfo.set(id, {
          timeInMilliseconds: null,
          waitedTimeInMilliseconds: null,
        });
      }
    });
  }

  @action
  handleUserNotification(params) {
    let { patient, duration } = params;
    let newTime = duration;
    const intervalFunction = () => {
      if (this.patientNotificationInfo.has(patient.id)) {
        newTime += 1000;
        if (
          this.patientNotificationInfo.get(patient.id)
            .waitedTimeInMilliseconds >=
          this.ATTENTION_WAIT_TIME_IN_MINUTES * 60 * 1000
        ) {
          this.handleTimeExceeded(patient);
          this.patientNotificationInfo.set(patient.id, {
            timeInMilliseconds: duration,
            waitedTimeInMilliseconds: null,
            timeIntervalFunction: clearTimeout(
              this.patientNotificationInfo.get(patient.id).timeIntervalFunction,
            ),
          });
        } else {
          this.patientNotificationInfo.set(patient.id, {
            timeInMilliseconds: duration,
            waitedTimeInMilliseconds: newTime,
            timeIntervalFunction: this.patientNotificationInfo.get(patient.id)
              .timeIntervalFunction,
          });
        }
      } else {
        clearInterval(timeIntervalFunction);
      }
    };
    const timeIntervalFunction = setInterval(intervalFunction, 1000);
    this.patientNotificationInfo.set(patient.id, {
      timeInMilliseconds: this.patientNotificationInfo.get(patient.id)
        .timeInMilliseconds,
      waitedTimeInMilliseconds: this.patientNotificationInfo.get(patient.id)
        .waitedTimeInMilliseconds,
      timeIntervalFunction,
    });
  }

  handleTimeExceeded(item) {
    if (
      !!this.getReadyForDoctor(parseInt(item.id)) &&
      'audio' in this.getReadyForDoctor(parseInt(item.id)) &&
      this.getReadyForDoctor(item.id).attentionRequired
    ) {
      /**
       * If 'audio' is present in readyForDoctor, this means, the time exceeded alarm is raised from PatientBoard component.
       * In this case, don't do anything. If this is not the case i.e. if the user goes to a different screen and refreshes the page,
       * then the else block will get executed as the PatientBoard component is not mounted.
       */
    } else {
      let audio = new Audio(TimeExceededAudio);
      const playAudio = () => {
        audio.loop = true;
        audio.play();
        setTimeout(() => {
          audio.loop = false;
          audio.currentTime = 0;
          audio.pause();
        }, 10000);
      };
      const stopAudio = () => {
        audio.currentTime = 0;
        audio.pause();
      };
      PushNotification.showWaitingForDoctorNotification(
        item.firstname + ' ' + item.lastname,
        this.ATTENTION_WAIT_TIME_IN_MINUTES,
      );
      this.editAttentionRequired(item.id, true, {
        audio,
        playAudio,
        stopAudio,
      });
      // const readyObj = this.getReadyForDoctor(item.id);
      // readyObj.playAudio();
    }
  }

  @action
  editAttentionRequired(id, value, audioInfo) {
    if (!!audioInfo && Object.keys(audioInfo).length > 0) {
      const { audio, playAudio, stopAudio } = audioInfo;
      this.readyForDoctor.set(id, {
        attentionRequired: value,
        audio,
        playAudio,
        stopAudio,
      });
    } else {
      this.readyForDoctor.set(id, {
        attentionRequired: value,
      });
    }
  }

  getReadyForDoctor = createTransformer((id) => {
    return this.readyForDoctor.get(id);
  });

  async editReadyForDoctor(item, subState) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/lobby`, {
      method: 'POST',
      body: JSON.stringify({
        patientId: item.patient_id,
        appointmentId: item.appointment_id,
        subState,
        eventInitiatorId,
      }),
    }).then((res) => {
      this.fetchList({ refreshList: true });
      return res.json();
    });
  }

  async readyForDoctorSms(item) {
    const errorMsg =
      'An unexpected error occurred while attempting to send ready for doctor sms';
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/lobby/ready-for-doctor-sms`,
        {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: item.appointment_id,
          }),
        },
      ).then((res) => {
        return res.json();
      });
      if (!response.success) {
        throw Error(errorMsg);
      }
      return response.data;
    } catch (err) {
      throw Error(errorMsg);
    }
  }

  async getApiHandler(id) {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    console.log([patientInfo]);
    return patientInfo;
  }

  async listApiHandler(params) {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/lobby${serializeToQueryString(params)}`,
    ).then((r) => r.json());
    return response.data;
  }

  addPatientsBulk = flow(function* (patients) {
    yield this._addPatientsBulk(patients);
    yield this.addPatientsBulkCallback();
    this.initializePatientNotificationInfo();
  });

  async _addPatientsBulk(patients) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/lobby/bulk`, {
      method: 'POST',
      body: JSON.stringify({
        patients,
        eventInitiatorId,
      }),
    }).then((response) => response.json());
  }

  async addPatientsBulkCallback() {
    await this.fetchList({ refreshList: true });
  }

  reorderPatientState = flow(function* ({
    patientId,
    appointmentId,
    state,
    index,
    reset,
  }) {
    yield this._reorderPatientState({
      patientId,
      appointmentId,
      state,
      index,
      reset,
    });
    yield this.reorderPatientCallback();
  });

  async _reorderPatientState({
    patientId,
    appointmentId,
    state,
    index,
    reset,
  }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/lobby`, {
      method: 'PUT',
      body: JSON.stringify({
        patientId,
        appointmentId,
        state,
        index,
        reset,
        eventInitiatorId,
      }),
    }).then((response) => response.json());
  }

  async reorderPatientCallback() {
    await this.fetchList({ refreshList: true });
  }

  async refreshBoardIfAppointmentExists(appt) {
    if (
      appt?.id &&
      Object.values(this.datum).findIndex(
        (item) => item.appointment_id === appt.id,
      ) > -1
    ) {
      await this.fetchList({ refreshList: true });
    }
  }

  async refreshBoardIfPatientExists(patient) {
    if (
      patient?.id &&
      Object.values(this.datum).findIndex(
        (item) => item.patient_id === patient.id,
      ) > -1
    ) {
      await this.fetchList({ refreshList: true });
    }
  }

  updatePatient = flow(function* ({
    patientId,
    appointmentId,
    roomId,
    completed,
  }) {
    yield this._updatePatient({ patientId, appointmentId, roomId, completed });
    yield this.updatePatientCallback();
  });

  async _updatePatient({ patientId, appointmentId, roomId, completed }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/lobby`, {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        appointmentId,
        roomId,
        completed,
        eventInitiatorId,
      }),
    }).then((response) => response.json());
  }

  async updatePatientCallback(params) {
    if (params && params.subState === DASHBOARD_SUB_STATE.READY_FOR_DOCTOR) {
      const playAudio = () => {
        const audio = new Audio(ReadyForDoctorAudio);
        audio.play();
      };
      PushNotification.showReadyForDoctorNotification(
        params.firstname + ' ' + params.lastname,
        playAudio,
      );
    }
    await this.fetchList({ refreshList: true });
  }

  updatePatientNotes = flow(function* (appointmentId, notes) {
    yield this._updatePatientNotes(appointmentId, notes);
    yield this.fetchList({ refreshList: true });
  });

  async _updatePatientNotes(appointmentId, notes) {
    return this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/appointments/note/${appointmentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ note: notes }),
      },
    );
  }

  removePatient = flow(function* (appointmentId) {
    yield this._removePatient(appointmentId);
    yield this.fetchList({ refreshList: true });
    this.initializePatientNotificationInfo();
  });

  async _removePatient(appointmentId) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/lobby/${appointmentId}`, {
      method: 'DELETE',
    });
  }

  getPatientsByState = createTransformer(
    ({ state, sortByCompleted = false }) => {
      let patients = Object.values(this.datum).filter(
        (item) => item.state === state,
      );

      return patients.sort((a, b) =>
        sortByCompleted === true
          ? a.completed - b.completed === 0
            ? a.state_order - b.state_order
            : a.completed - b.completed
          : a.state_order - b.state_order,
      );
    },
  );

  isPatientAlreadyAdded = createTransformer(({ patientId }) => {
    return Object.values(this.datum).some(
      (item) => item.patient_id === patientId,
    );
  });

  isAppointmetAlreadyAdded = createTransformer(({ appointmentId }) => {
    return Object.values(this.datum).some(
      (item) => item.appointment_id === appointmentId,
    );
  });

  /**
   * Patient Sync settings page methods
   */

  async fetchMappedOptions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/lobby-status`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the open dental options',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the open dental options',
      );
    }
  }

  async fetchStatusDefinitions() {
    try {
      const params = {
        category: 'ApptConfirmed',
      };

      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/definitions${serializeToQueryString(
          params,
        )}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the statuses',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the statuses',
      );
    }
  }

  async updateStatus(statusInfo) {
    const { state, odDefId } = statusInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/lobby-status`,
        {
          method: 'PUT',
          body: JSON.stringify({
            state,
            odDefId,
          }),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the status',
        );
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the status',
      );
    }
  }
}
