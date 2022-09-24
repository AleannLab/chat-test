import CONSTANTS from 'helpers/constants';
import { action, observable } from 'mobx';
import Resource from './utils/resource';

export class IvrSettings extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  @observable memberSearchVal = '';

  @action
  setMemberSearchVal(value) {
    this.memberSearchVal = value;
  }

  async fetchIvr() {
    try {
      let url = `${CONSTANTS.CALL_CONTROL_API_URL}/ivr`;
      const response = await this.fetch(url).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the IVRs',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  async fetchGroups() {
    try {
      let url = `${CONSTANTS.CALL_CONTROL_API_URL}/group`;
      const response = await this.fetch(url).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the groups',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  async fetchUsers() {
    try {
      let url = `${CONSTANTS.PBX_API_URL}/sip-peers`;
      const response = await this.fetch(url).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the users',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  // This function is used to delete selected ivr
  async deleteIvr(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the procedure',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the procedure',
      );
    }
  }

  async deleteIvrMultiple(data) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/bulkDelete`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the IVR',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the IVR',
      );
    }
  }

  async getGroupInfo(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group/${id}`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to get the Group Info',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to get the Group Info',
      );
    }
  }

  async addGroup(data) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to add the Group',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to add the Group',
      );
    }
  }

  async updateGroup(id, data) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to add the Group',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to add the Group',
      );
    }
  }

  async deleteGroup(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the Group',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the Group',
      );
    }
  }

  async deleteGroupMultiple(data) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group/bulkDelete`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to delete the Group',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to delete the Group',
      );
    }
  }

  // This function is used to delete selected ivr
  async updateIvr({ id, data }) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the procedure',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the procedure',
      );
    }
  }
}
