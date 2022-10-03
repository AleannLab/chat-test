import { flow } from 'mobx';

import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class CallForwarding extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }
  async listApiHandler() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the call forwarding data',
        );
      } else {
        const data = response.data;

        // Select "Don't forward calls" if none of the entries is set to default
        let count = 0;
        data.forEach((call) => {
          if (call.default === 0) {
            count += 1;
          }
        });
        if (count === data.length) {
          data.unshift({
            id: -1,
            name: "Don't forward calls",
            default: 1,
            uuid: 'disable',
          });
        } else {
          data.unshift({
            id: -1,
            name: "Don't forward calls",
            default: 0,
            uuid: 'disable',
          });
        }
        return data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the call forwarding data',
      );
    }
  }

  addNumber = flow(function* ({ did, name }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding`,
        {
          method: 'POST',
          body: JSON.stringify({
            did,
            name,
            default: false,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        if (response.error.Code === 'DUPLICATE_DID') {
          throw Error('This number already exists in the call forwarding list');
        }
        throw Error(
          'An unexpected error occurred while attempting to add the number',
        );
      }
    } catch (err) {
      if (err.message.includes('already exists')) {
        throw Error('This number already exists in the call forwarding list');
      }
      throw Error(
        'An unexpected error occurred while attempting to add the number',
      );
    }
  });

  updateDefaultNumber = flow(function* ({ uuid, isDefault }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding/${uuid}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            default: isDefault,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the default value',
        );
      }
      yield this.store.authentication.refreshUser();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the default value',
      );
    }
  });

  deleteNumber = flow(function* ({ uuid }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding/${uuid}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the number',
        );
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the number',
      );
    }
  });

  disableCallForwarding = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding/disable`,
        {
          method: 'POST',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to disable call forwarding',
        );
      }
      yield this.store.authentication.refreshUser();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to disable call forwarding',
      );
    }
  });
}
