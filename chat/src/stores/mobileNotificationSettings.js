import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';
import { flow, action, observable } from 'mobx';
import moment from 'moment-timezone';

import Resource from './utils/resource';
export class MobileNotificationSettings extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  @observable notificationSettings = [];
  @observable tenantInfoLoaded = false;
  @observable patientInfoLoaded = false;
  @observable notificationInfoLoaded = false;
  @observable addingNewNotification = false;
  @observable deletingNotification = false;
  @observable appointmentInfoLoaded = false;
  @observable patientInformation = {
    id: null,
    firstName: null,
    lastName: null,
    email: null,
    phoneNo: null,
  };
  @observable tenantInformation = {
    id: null,
    telnyxNumber: null,
    phoneNo: null,
    timezone: null,
  };
  @observable appointments = [];

  @action.bound
  setTenantInfoLoaded(value) {
    this.tenantInfoLoaded = value;
  }

  @action.bound
  setPatientInfoLoaded(value) {
    this.patientInfoLoaded = value;
  }

  @action.bound
  setNotificationInfoLoaded(value) {
    this.notificationInfoLoaded = value;
  }

  @action.bound
  setAddingNewNotification(value) {
    this.addingNewNotification = value;
  }

  @action.bound
  setDeletingNotification(value) {
    this.deletingNotification = value;
  }

  @action.bound
  setAppointmentInfoLoaded(value) {
    this.appointmentInfoLoaded = value;
  }

  @action.bound
  resetAppointments() {
    this.appointments.clear();
  }

  @action.bound
  addAppointment(appointment) {
    this.appointments.push(appointment);
  }

  @action.bound
  setTenantInformation({
    id = this.tenantInformation.id,
    telnyxNumber = this.tenantInformation.telnyxNumber,
    phoneNo = this.tenantInformation.phoneNo,
    timezone = this.tenantInformation.timezone,
  }) {
    this.tenantInformation = {
      id,
      telnyxNumber,
      phoneNo,
      timezone,
    };
  }

  @action.bound
  setPatientInformation({
    id = this.patientInformation.id,
    firstName = this.patientInformation.firstName,
    lastName = this.patientInformation.lastName,
    email = this.patientInformation.email,
    phoneNo = this.patientInformation.phoneNo,
  }) {
    this.patientInformation = {
      id,
      firstName,
      lastName,
      email,
      phoneNo,
    };
  }

  fetchTenantInfo = flow(function* ({ patientSecret }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config/tenant-details`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the office details',
        );
      } else {
        this.setTenantInformation({
          id: response.data.id,
          telnyxNumber: response.data.telnyxNumber,
          phoneNo: response.data.phoneNo,
          timezone: response.data.timeZone,
        });
        this.setTenantInfoLoaded(true);
      }
    } catch (err) {
      console.error(err.message);
      throw Error(
        'An unexpected error occurred while attempting to fetch the office details',
      );
    }
  });

  fetchPatientInfo = flow(function* ({ patientSecret }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config/patient`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the data',
        );
      } else {
        this.setPatientInformation({
          id: response.data.id,
          firstName: response.data.firstname,
          lastName: response.data.lastname,
          email: response.data.email,
          phoneNo: response.data.phone_no,
        });
        this.setPatientInfoLoaded(true);
      }
    } catch (err) {
      console.error(err.message);
      throw Error(
        'An unexpected error occurred while attempting to fetch the data',
      );
    }
  });

  fetchNotifications = flow(function* ({ id, patientSecret }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config?patientId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        this.setNotificationInfoLoaded(true);
        throw Error(
          'An unexpected error occurred while attempting to fetch the notifications',
        );
      } else {
        response.data.forEach((notification) => {
          this.notificationSettings.push(notification);
        });
        this.setNotificationInfoLoaded(true);
      }
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to fetch the notifications',
      );
    }
  });

  @action.bound
  fetchLastNotification = flow(function* ({ id, patientSecret }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config?patientId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        this.setAddingNewNotification(false);
        throw Error(
          'An unexpected error occurred while attempting to fetch the recent notification',
        );
      } else {
        const notification = response.data[response.data.length - 1];
        this.notificationSettings.push(notification);
        this.setAddingNewNotification(false);
      }
    } catch (err) {
      this.setAddingNewNotification(false);
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to fetch the recent notification',
      );
    }
  });

  @action.bound
  addNotificationSetting = flow(function* ({ id, patientSecret }) {
    try {
      this.setAddingNewNotification(true);
      const delivery_method = 'SMS';
      const time = 1;
      const unit = 'days';
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
          body: JSON.stringify({
            delivery_method,
            patient_id: id,
            time,
            unit,
          }),
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to add the notififcation',
        );
      }
    } catch (err) {
      this.setAddingNewNotification(false);
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to add the notififcation',
      );
    }
  });

  @action.bound
  editNotificationSetting(id, changedValue, changedValueType) {
    this.notificationSettings.forEach((notification) => {
      if (notification.id === id) {
        notification[changedValueType] = changedValue;
      }
    });
  }

  @action.bound
  async synchronizeNotificationSettings({ id, patientSecret }) {
    await Promise.all(
      this.notificationSettings.map(async (notification) => {
        const time = notification.time;
        const unit = notification.unit;
        try {
          const response = await this.fetch(
            `${CONSTANTS.OFFICE_API_URL}/notification-config/${notification.id}`,
            {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${patientSecret}`,
              },
              body: JSON.stringify({
                delivery_method: notification.delivery_methods,
                patient_id: id,
                time,
                unit,
              }),
            },
            null,
            AUTHORIZATION_TYPE.PATIENT,
          ).then((res) => res.json());
          if (!response.success) {
            throw Error(
              'An unexpected error occurred while attempting to save the settings',
            );
          }
        } catch (err) {
          console.error(err);
          throw Error(
            'An unexpected error occurred while attempting to save the settings',
          );
        }
      }),
    ).catch((err) => {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to save the settings',
      );
    });
  }

  @action.bound
  removeNotificationSetting = flow(function* ({
    notificationId,
    patientSecret,
  }) {
    this.setDeletingNotification(true);
    let notificationSettingsCopy = [...this.notificationSettings];
    this.notificationSettings.clear();
    notificationSettingsCopy.forEach((notification) => {
      if (notification.id !== notificationId) {
        this.notificationSettings.push(notification);
      }
    });
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        this.setDeletingNotification(false);
        throw Error(
          'An unexpected error occurred while attempting to delete the notification',
        );
      } else {
        this.setDeletingNotification(false);
      }
    } catch (err) {
      this.setDeletingNotification(false);
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to delete the notification',
      );
    }
  });

  fetchAppointments = flow(function* ({ patientSecret }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config/appointments`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
          },
        },
        null,
        AUTHORIZATION_TYPE.PATIENT,
      ).then((res) => res.json());
      if (!response.success) {
        this.setAppointmentInfoLoaded(true);
        throw Error(
          'An unexpected error occurred while attempting to fetch the appointments',
        );
      } else {
        response.data.forEach((appointment) => {
          const scheduleDateTime = moment
            .utc(appointment.start)
            .tz(this.tenantInformation.timezone);
          const currentDateTime = moment().tz(this.tenantInformation.timezone);
          if (moment(scheduleDateTime).isSameOrAfter(currentDateTime, 'day')) {
            this.addAppointment(appointment);
          }
        });
        this.setAppointmentInfoLoaded(true);
      }
    } catch (err) {
      console.error(err.message);
      throw Error(
        'An unexpected error occurred while attempting to fetch the appointments',
      );
    }
  });
}
