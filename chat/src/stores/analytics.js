import Resource from './utils/resource';
import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';
import { convertCurrentTime } from 'helpers/timezone';

export const MORNING_HUDDLE_TYPE = Object.freeze({
  YESTERDAY: 'MORNING_HUDDLE_YESTERDAY',
  TODAY: 'MORNING_HUDDLE_TODAY',
  TOMORROW: 'MORNING_HUDDLE_TOMORROW',
});

export class Analytics extends Resource {
  /**
   * Get total patient scheduled
   * @param {Date} date
   */
  async getTotalPatientScheduled(date = convertCurrentTime({ format: 'L' })) {
    try {
      const params = {
        scheduledDate: date,
      };

      const response = await this.fetch(
        `${
          CONSTANTS.OFFICE_API_URL
        }/analytics/lobby-stats?${new URLSearchParams(params).toString()}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch analytics for patient scheduled!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get estimated net production
   * @param {Date} date
   * @param {Number} pastDaysCount
   */
  async getEstimatedNetProduction(
    date = convertCurrentTime({ format: 'L' }),
    pastDaysCount = 7,
  ) {
    try {
      const params = {
        scheduledDate: date,
        lastDays: pastDaysCount,
      };

      const response = await this.fetch(
        `${
          CONSTANTS.OFFICE_API_URL
        }/analytics/production-estimate?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch analytics for patient scheduled!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get balance due for the patients
   * @param {Date} date
   */
  async getBalanceDue(date = convertCurrentTime({ format: 'L' })) {
    try {
      const params = {
        scheduledDate: date,
      };

      const response = await this.fetch(
        `${
          CONSTANTS.OFFICE_API_URL
        }/analytics/balance-due?${new URLSearchParams(params).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch balance due!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get Analytics for Morning Huddle
   * @param {String} key
   */
  async getMorningHuddleData(key = MORNING_HUDDLE_TYPE.TODAY) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/analytics/store/?${new URLSearchParams({
          key,
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch morning huddle data!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * @param {String} config
   */
  async getGoalByType(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: config,
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch goal!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * @param {Object} reqObj
   */
  async setGoalByType(reqObj) {
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
          'An unexpected error occurred while attempting to set goal!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw Error(e);
    }
  }
}
