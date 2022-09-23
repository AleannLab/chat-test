import { action, observable, flow } from 'mobx';
import { serializeToQueryString } from 'helpers/misc';
import { createTransformer } from 'mobx-utils';

import Resource from './utils/resource';
import CONSTANTS from 'helpers/constants';

export class VacationGreeting extends Resource {
  constructor(store, greetingType) {
    super(store);
    this.type = greetingType;
  }

  @observable selectedHoldMusic = {};

  @action
  setSelectedHoldMusic = (payload) => {
    this.selectedHoldMusic = payload;
  };

  @observable currentlyPlaying = {
    uuid: null,
    shouldPlay: false,
    downloadUrl: null,
    file: null,
    name: null,
  };

  @action.bound
  setCurrentlyPlaying({
    uuid = this.currentlyPlaying.uuid,
    shouldPlay = this.currentlyPlaying.shouldPlay,
    downloadUrl = this.currentlyPlaying.downloadUrl,
    file = this.currentlyPlaying.file,
  }) {
    this.currentlyPlaying = {
      uuid,
      shouldPlay,
      downloadUrl,
      file,
    };
  }

  async listApiHandler() {
    let query = serializeToQueryString({ greetingType: this.type });
    let response = await this.fetch(
      `${CONSTANTS.CALL_CONTROL_API_URL}/greeting${query}`,
    ).then((res) => res.json());
    if (response.success) {
      return response.data;
    } else {
      throw Error(
        'An unexpected error occurred while attempting to fetch the greetings',
      );
    }
  }

  addGreeting = flow(function* (fileName, uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: fileName,
            uuid: uuid,
            greetingType: this.type,
          }),
        },
      ).then((res) => res.json());
      if (response.success) {
        yield this.fetchList();
      } else {
        throw Error(
          'An unexpected error occurred while attempting to add the greeting',
        );
      }
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to add the greeting',
      );
    }
  });

  deleteGreeting = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (response.success) {
        yield this.fetchList();
      } else {
        throw Error(
          'An unexpected error occurred while attempting to delete the greeting',
        );
      }
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to add the greeting',
      );
    }
  });

  getVacations = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/vacations`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      if (response.success) {
        return response.data.vacations;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to fetch the greeting',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to fetch the greeting';
    }
  });
  getVacationsHistory = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/vacations`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      if (response.success) {
        return response.data.history;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to fetch the greeting',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to fetch the greeting';
    }
  });

  addVacation = flow(function* ({ method, ...rest }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/vacation`,
        {
          method: method,
          body: JSON.stringify({ ...rest }),
        },
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to add the vacation',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to add the vacation';
    }
  });

  editVacation = flow(function* ({ id, ...rest }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/vacation/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ ...rest }),
        },
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to add the vacation',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to add the vacation';
    }
  });

  deleteVacation = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/vacation/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to delete the vacation',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to delete the vacation';
    }
  });

  getGreetings = flow(function* () {
    let query = serializeToQueryString({ greetingType: this.type });
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting${query}`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          'An unexpected error occurred while attempting to add the greeting',
        );
      }
    } catch (e) {
      throw 'An unexpected error occurred while attempting to add the greeting';
    }
  });
  updateGreetingName = flow(function* (id, name) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ name }),
        },
      ).then((res) => res.json());
      if (response.success) {
        yield this.fetchList();
      } else {
        throw Error(
          'An unexpected error occurred while attempting to update the greeting name',
        );
      }
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to update the greeting name',
      );
    }
  });

  updateDefaultGreeting = flow(function* (id, isDefault) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            default: isDefault,
            greetingType: this.type,
          }),
        },
      ).then((res) => res.json());
      if (response.success) {
        yield this.fetchList();
      } else {
        throw Error(
          'An unexpected error occurred while attempting to set the default greeting',
        );
      }
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to set the default greeting',
      );
    }
  });

  uploadGreeting = flow(function* (fileName, file) {
    try {
      const filename = fileName;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = 'Test';
      const patient_id = 0;
      const did = '';
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        did,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`,
      ).then((res) => res.json());
      if (!response.uuid) {
        throw Error(
          'An unexpected error occurred while attempting to upload the greeting',
        );
      } else {
        return response;
      }
    } catch (err) {
      throw 'An unexpected error occurred while attempting to upload the greeting';
    }
  });

  getGreetingById = createTransformer(({ id }) => {
    let greeting = Object.values(this.datum).find((g) => g.uuid === id);
    if (greeting) {
      return greeting.name;
    }
  });

  getDownloadGreetingById = flow(function* (uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/${uuid}/download`,
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to download the greeting',
      );
    }
  });
}
