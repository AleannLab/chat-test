import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';
import { endLoading, startLoading } from 'helpers/loadstates';
import { capitalizeFirstLetter, guidGenerator } from 'helpers/misc';
import { get as _get } from 'lodash';
import { flow, observable } from 'mobx';
import { createTransformer } from 'mobx-utils';
import ErrorLogs from 'helpers/errorLogs';

export class Resource {
  auth = {};
  notification = {};
  @observable loading = false;
  @observable loaded = false;
  @observable total = 0;
  @observable error = {};
  @observable data = [];

  @observable datum = {};

  async fetch(
    url = '',
    data = {},
    token = null,
    authType = AUTHORIZATION_TYPE.USER,
  ) {
    const INTERACTION_ID = guidGenerator();
    try {
      let session = null;
      const tenantId =
        CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0];

      if (authType === AUTHORIZATION_TYPE.TENANT) {
        token = `${CONSTANTS.ENV}-${tenantId}-tenant`;
      } else {
        session = await this.authentication.refreshAndGetSession({});
      }

      let result = await fetch(url, {
        ...data,
        headers: {
          'Content-Type': 'application/json',
          'x-custom-tenant-id': tenantId,
          'x-interaction-id': INTERACTION_ID,
          ...(session
            ? {
                Authorization: `Bearer ${session
                  .getAccessToken()
                  .getJwtToken()}`,
                AuthorizationType: authType,
              }
            : token
            ? {
                Authorization: `Bearer ${token}`,
                AuthorizationType: authType,
              }
            : {}),
          ...(data ? data.headers : []),
        },
      });

      if (result.status === 403) {
        this.authentication.logout({});
      } else if (result.status !== 200) {
        ErrorLogs.captureException(`API Error`, INTERACTION_ID);

        // const response = await result.json();
        // const errorMessage = response?.error?.DetailedMessage
        //   ? response.error.DetailedMessage
        //   : 'Unknown error';
        // ErrorLogs.captureException(
        //   `API error - ${errorMessage}`,
        //   INTERACTION_ID,
        // );
      }

      return result;
    } catch (e) {
      if (e.name !== 'AbortError') {
        ErrorLogs.captureException(e.message, INTERACTION_ID);
        throw Error(
          'An unexpected error occurred while attempting to fetch the resources',
        );
      }
    }
  }

  constructor({ notification, authentication, utils, ...store }) {
    this.authentication = authentication;
    this.notification = notification;
    this.utils = utils;
    this.store = store;
  }

  set(id) {
    // let obj = this.datum[id]
    // dotProp.set(obj, path, val);
    this.datum[id] = {};
  }

  fetchList = flow(function* (params) {
    const { refreshList } = params || {};

    this.loading = true;
    try {
      let results = yield this.listApiHandler(params);
      if (refreshList === true) this.datum = {};
      results = results.map((result, index) => {
        this.datum[result.id] = this.listMapper(
          result,
          this.datum[result.id],
          index,
          results,
        );
        return result.id;
      });
      this.data = results;
      this.loading = false;
      this.loaded = true;
      return results;
    } catch (e) {
      console.error('Fetchlist error', e);
      this.error = e;
      this.notification.showError(
        'An unexpected error occurred while attempting to fetch the data',
      );
    }
  });

  async fetchListQuery(params) {
    try {
      const result = await this.listApiHandler(params);
      return result;
    } catch (e) {
      console.error('Fetchlist error', e);
      this.notification.showError(
        'An unexpected error occurred while attempting to fetch the data',
      );
    }
  }

  /**
   *
   * @param {*} newData
   * @param {*} oldData
   * @param {*} _index
   * @param {*} _results
   */
  listMapper(newData, oldData) {
    return {
      ...(oldData ? oldData : {}),
      ...(newData ? newData : {}),
    };
  }

  fetchOne = flow(function* (args) {
    this.loading = true;
    this.error = {};
    try {
      yield this.getApiHandler(args);
      // this._data.set(args, { ...this._data.get(args), ...results });
      this.loading = false;
      this.loaded = true;
    } catch (e) {
      console.error('Get error', e);
      this.notification.showError(
        'An unexpected error occurred while attempting to fetch the data',
      );
      this.error = e;
    }
  });

  get = createTransformer(([defaultVal, ...path]) => {
    const val = _get(this.datum, path, defaultVal);
    if (val) return val;
    return defaultVal;
  });

  delete = flow(function* (args) {
    this.loading = true;
    this.error = {};
    try {
      yield this.deleteApiHandler(args);
      this.loading = false;
      this.loaded = true;
      //yield this.list();
      yield this.fetchList();
    } catch (e) {
      console.error('Delete error', e);
      this.error = e;
      this.notification.showError(
        'An unexpected error occurred while attempting to delete the resources',
      );
    }
  });

  create = flow(function* (args) {
    this.loading = true;
    this.error = {};
    try {
      yield this.createApiHandler(args);
      this.loading = false;
      this.loaded = true;
      yield this.fetchList();
    } catch (e) {
      console.error('Create error', e);
      this.error = e;
      this.notification.showError(
        'An unexpected error occurred while attempting to create the resources',
      );
    }
  });

  update = flow(function* (args) {
    this.loading = true;
    this.error = {};
    try {
      yield this.updateApiHandler(args);
      this.loading = false;
      this.loaded = true;
      yield this.list();
    } catch (e) {
      console.error('Update error', e);
      this.error = e;
      this.notification.showError(
        'An unexpected error occurred while attempting to update the resources',
      );
    }
  });

  registerSubResource = ({ resourceNamePlural }, { fetchList }) => {
    const syncState = `__${resourceNamePlural}_sync`;
    const fetchAllName = `fetch${capitalizeFirstLetter(resourceNamePlural)}`;
    this[fetchAllName] = flow(function* ({ id, ...params }) {
      try {
        this.datum[id][syncState] = startLoading(this.datum[id][syncState]);
        let resourceData = yield fetchList({ id, ...params });
        this.datum[id][syncState] = endLoading(this.datum[id][[syncState]]);
        resourceData = resourceData.map((resource) => {
          this.store[resourceNamePlural].inject(resource);
          return resource.id;
        });
        this.datum[id][resourceNamePlural] = resourceData;
      } catch (e) {
        console.error(
          `****** \n Error for resource ${resourceNamePlural} while ${fetchAllName}:  ${e.message} \n*******`,
        );
        this.error = e;
        this.notification.showError(
          `An unexpected error occurred while attempting to fetch the ${resourceNamePlural}`,
        );
      }
    });
  };

  inject(args) {
    this.datum[args.id] = args;
  }

  errorFormatter(type, e) {
    return e.message;
  }

  messageFormatter() {
    return 'done!';
  }

  async listApiHandler() {
    return [];
  }
  async getApiHandler() {
    return {};
  }

  async deleteApiHandler() {}

  async createApiHandler() {}

  async updateApiHandler() {}
}

export default Resource;
