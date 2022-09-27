import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class AppointmentReminder extends Resource {
  async fetchReminders() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config-default`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the appointment reminders',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the appointment reminders',
      );
    }
  }

  async addReminder(appointmentInfo) {
    const { type, time, unit } = appointmentInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config-default`,
        {
          method: 'POST',
          body: JSON.stringify({
            type,
            time,
            unit,
            isActive: true,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to add the reminder',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to add the reminder',
      );
    }
  }

  async updateReminderStatus(appointmentInfo) {
    const { id, isActive } = appointmentInfo;
    console.debug(id);
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config-default/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            isActive,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the reminder',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the reminder',
      );
    }
  }

  async updateReminderData(appointmentInfo) {
    const { id, type, time, unit } = appointmentInfo;
    console.debug(id);
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config-default/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            type,
            time,
            unit,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the reminder',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the reminder',
      );
    }
  }

  async deleteReminder(appointmentInfo) {
    const { id } = appointmentInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-config-default/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the reminder',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the reminder',
      );
    }
  }
}
