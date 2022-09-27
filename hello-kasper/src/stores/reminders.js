import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class Reminders extends Resource {
  /**
   * Fetch office configs
   * @param {String} config
   * @returns {Object}
   */
  async getOfficeConfigs(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: config,
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the office configs!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update office configs
   * @param {Object} reqObj
   * @returns {Object}
   */
  async updateOfficeConfigs(reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config`,
        {
          method: 'PUT',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to update office configs!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Fetch reminder config
   * @param {number} id
   * @param {String} config
   * @returns {Object}
   */
  async getReminderConfig(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config?${new URLSearchParams({
          reminder_types: config,
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the reminder config!',
        );
      } else {
        return response.data.flat();
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update reminder config
   * @param {number} id
   * @param {Object} reqObj
   * @returns {Object}
   */
  async updateReminderConfig(id, reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to update reminder config!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Delete reminder config
   * @param {number} id
   * @param {Object} reqObj
   * @returns {Object}
   */
  async deleteReminderConfig(id, reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config/${id}`,
        {
          method: 'DELETE',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to delete reminder config!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Add new reminder config
   * @param {Object} req
   * @returns {Object}
   */
  async addReminderConfig(req) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config`,
        {
          method: 'POST',
          body: JSON.stringify(req),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to add new appointment reminder!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Fetch open dental statuses
   * @returns {Object}
   */
  async getODStatuses() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/definitions?${new URLSearchParams({
          category: 'ApptConfirmed',
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the statuses!',
        );
      } else {
        return response.data.flat();
      }
    } catch (e) {
      throw e.message;
    }
  }
}
