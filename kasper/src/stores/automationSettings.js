import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class AutomationSettings extends Resource {
  async getAutomationSettings() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.VOIP_API_URL}/automation-setting`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the automation settings!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to fetch the automation settings!';
    }
  }

  async updateAutomationSettings(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.VOIP_API_URL}/automation-setting`,
        {
          method: 'POST',
          body: JSON.stringify(config),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to update the automation settings!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to update the automation settings!';
    }
  }
}
