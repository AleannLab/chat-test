import CONSTANTS from 'helpers/constants';
import { flow } from 'mobx';

import Resource from './utils/resource';

export class HardwarePhone extends Resource {
  async listApiHandler() {
    let response = await this.fetch(
      `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone`,
    )
      .then((r) => r.json())
      .then((r) => r.data);
    return response;
  }

  addHardwarePhone = flow(function* (label_name) {
    yield this._addHardwarePhoneAPI({
      name: label_name,
    });
    yield this.fetchList();
  });

  async _addHardwarePhoneAPI({ name }) {
    return this.fetch(`${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone`, {
      method: 'POST',
      body: JSON.stringify({
        name,
      }),
    }).then((res) => res.json());
  }

  deleteHardwarePhone = flow(function* (id) {
    yield this._deleteHardwarePhoneAPI({ id });
    yield this.fetchList();
  });

  async _deleteHardwarePhoneAPI({ id }) {
    return this.fetch(
      `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone/${id}`,
      {
        method: 'DELETE',
      },
    ).then((res) => res.json());
  }

  updateHardwarePhone = flow(function* (id, status) {
    yield this._updateHardwarePhone({
      id,
      status,
    });
    yield this.fetchList();
  });

  async _updateHardwarePhone({ id, status }) {
    if (status) {
      return this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            active: false,
          }),
        },
      ).then((res) => res.json());
    } else {
      return this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            active: true,
          }),
        },
      ).then((res) => res.json());
    }
  }
}
