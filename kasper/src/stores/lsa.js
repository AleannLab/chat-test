import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';
import Resource from './utils/resource';

export class LocalServerApp extends Resource {
  async getLSAConfig() {
    try {
      const tenantId =
        CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0];

      const response = await this.fetch(
        `${CONSTANTS.ADMIN_API_URL}/office/lsa/config`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the lsa config!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }
}
