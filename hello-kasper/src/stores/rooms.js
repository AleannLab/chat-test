import Resource from './utils/resource';
import { serializeToQueryString } from 'helpers/misc';
import { flow } from 'mobx';
import CONSTANTS from 'helpers/constants';

export class Room extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  async listApiHandler(params) {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/rooms${serializeToQueryString(params)}`,
    ).then((r) => r.json());
    return response.data;
  }

  async _addApiHandler({ name }) {
    try {
      const response = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/rooms`, {
        method: 'POST',
        body: JSON.stringify({
          name,
        }),
      }).then((res) => res.json());
      console.debug(response);
      if (!response.success) throw Error('Room name already exists');
    } catch (e) {
      throw Error(e);
    }
  }

  add = flow(function* ({ name }) {
    try {
      yield this._addApiHandler({ name });
      yield this.fetchList();
    } catch (e) {
      throw Error(e);
    }
  });

  async _editApiHandler({ id, name, archived }) {
    return await this.fetch(`${CONSTANTS.OFFICE_API_URL}/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, archived }),
    }).then((res) => res.json());
  }

  edit = flow(function* ({ id, name, archived }) {
    yield this._editApiHandler({ id, name, archived });
    yield this.fetchList();
  });

  // async _delete({ id }) {
  //     return this.fetch(`${CONSTANTS.OFFICE_API_URL}/rooms/${id}`, {
  //         method: "DELETE",
  //     }).then((response) => response.json());
  // }

  // delete = flow(function* ({ id }) {
  //     yield this._delete({ id });
  //     yield this.fetchList();
  // });

  async _bulkDelete({ ids }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/rooms`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }).then((response) => response.json());
  }

  bulkDelete = flow(function* ({ ids }) {
    yield this._bulkDelete({ ids });
    yield this.fetchList();
  });
}
