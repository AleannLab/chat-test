import Resource from './utils/resource';
import CONSTANTS from 'helpers/constants';

export class HardwarePhones extends Resource {
  async fetchHardwarePhones() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers?hardwarePhone=true`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the hardware phones',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  async getHardwarePhone(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${id}`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the hardware phone details',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  async updateHardwarePhone({ data, id }) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.DetailedMessage ||
            'An unexpected error occurred while attempting to update the phone directory',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  async rebootHardwarePhone(hardwarePhoneID) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/reboot-hardware-phone`,
        {
          method: 'POST',
          body: JSON.stringify({ id: hardwarePhoneID }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.DetailedMessage ||
            'An unexpected error occurred while attempting to reboot the hardware phone',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }
}
