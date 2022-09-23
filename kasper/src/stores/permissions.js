import CONSTANTS from 'helpers/constants';
import { action, observable } from 'mobx';
import Resource from './utils/resource';

export class Permissions extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
    this.usersPermissions = null;
    this.subPermissions = null;
    this.groupPermissions = null;
    this.jsonPermissions = null;
    this.userRoles = null;
  }
  @observable
  phoneAccess = false;

  @action
  setPhoneAccess(usersPermissions) {
    const phoneAccess = usersPermissions.find(
      (permission) => permission.permission_id === 3 && permission.enabled,
    );
    this.phoneAccess = !!phoneAccess;
  }

  async init() {}
  async getUserPermissions(user_id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/user-permissions/?userId=` + user_id,
        {
          method: 'GET',
        },
      );

      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      const data = await response.json();
      this.setPhoneAccess(data);
      return data;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async addUserPermissions(userId, permissions) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/user-permissions`,
        {
          method: 'PUT',
          body: JSON.stringify({
            userId: userId,
            permissions: permissions,
          }),
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async addUserPermission(permissionId, userId, enabled) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/user-permission`,
        {
          method: 'PUT',
          body: JSON.stringify({
            permissionId: permissionId,
            userId: userId,
            enabled: enabled,
          }),
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async updateUserPermission(permissionId, userId, enabled) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/user-permission`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            permissionId: permissionId,
            userId: userId,
            enabled: enabled,
          }),
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/user-permissions`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            permissions: permissions,
            userId: userId,
          }),
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async getUsersPermissions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/users-permissions`,
        {
          method: 'GET',
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch user permissions',
        );
      }
      const data = await response.json();
      this.usersPermissions = data;
      return data;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch user permissions ' +
          err,
      );
    }
  }
  async getSubPermissions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/permissions`,
        {
          method: 'GET',
        },
      );

      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch permissions',
        );
      }
      const data = await response.json();
      this.subPermissions = data;
      return data;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch permissions ' +
          err,
      );
    }
  }
  async getGroupPermissions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/groups`,
        {
          method: 'GET',
        },
      );

      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch permissions',
        );
      }
      const data = await response.json();
      this.groupPermissions = data;
      return data;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch permissions ' +
          err,
      );
    }
  }

  async getRoles() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/roles`,
        {
          method: 'GET',
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch permissions',
        );
      }
      const data = await response.json();
      this.userRoles = data;
      return response;
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch permissions ' +
          err,
      );
    }
  }
  async getRolePermissions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PERMISSIONS_API_URL}/permissions/roles`,
        {
          method: 'GET',
        },
      );
      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to fetch permissions',
        );
      }
      return response.json();
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch permissions ' +
          err,
      );
    }
  }

  async prepareJSONPermissions() {
    const permissionsData = [];
    this.groupPermissions.forEach((singlePermission, index) => {
      permissionsData.push({
        id: singlePermission.id,
        name: singlePermission.name,
        value: false,
      });
      const currentSubPermissions = this.subPermissions.filter(
        (object) => object.permissions_group_id == singlePermission.id,
      );
      if (currentSubPermissions.length > 0) {
        permissionsData[index]['subPermissions'] = [];
        currentSubPermissions.forEach((currentSubPermission) => {
          permissionsData[index].subPermissions.push({
            id: currentSubPermission.id,
            name: currentSubPermission.name,
            value: false,
          });
        });
      }
    });
    this.jsonPermissions = permissionsData;
  }

  getAdminPermissions() {
    const permissionsData = [];
    this.groupPermissions.forEach((singlePermission, index) => {
      permissionsData.push({
        id: singlePermission.id,
        name: singlePermission.name,
        value: true,
      });
      const currentSubPermissions = this.subPermissions.filter(
        (object) => object.permissions_group_id == singlePermission.id,
      );
      if (currentSubPermissions.length > 0) {
        permissionsData[index]['subPermissions'] = [];
        currentSubPermissions.forEach((currentSubPermission) => {
          permissionsData[index].subPermissions.push({
            id: currentSubPermission.id,
            name: currentSubPermission.name,
            value: true,
          });
        });
      }
    });
    this.adminPermissions = permissionsData;
  }
}
