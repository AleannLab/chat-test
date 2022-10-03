import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class Integrations extends Resource {
  /**
   * Fetch integration configs
   * @param {String} config
   * @returns {Object}
   */
  async getConfigs(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: config,
        }).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the integration configs!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update integration configs
   * @param {Object} reqObj
   * @returns {Object}
   */
  async updateConfigs(reqObj) {
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
            'An unexpected error occurred while attempting to update integration configs!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }
}
