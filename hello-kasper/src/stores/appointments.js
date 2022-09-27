import CONSTANTS from 'helpers/constants';
import { serializeToQueryString } from 'helpers/misc';
import Resource from './utils/resource';

export class Appointment extends Resource {
  async getApiHandler(id) {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/appointments/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    return patientInfo;
  }

  listApiHandler = async (params) => {
    this.loading = true;
    this.loaded = false;

    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/appointments${serializeToQueryString(
        params,
      )}`,
    ).then((r) => r.json());

    this.loading = false;
    this.loaded = true;

    if (!response.success) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the appointments',
      );
    } else {
      return response.data;
    }
  };
}
