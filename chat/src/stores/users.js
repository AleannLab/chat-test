import Resource from './utils/resource';
import AsyncStore from './utils/AsyncStore';
import { flow, action, observable } from 'mobx';
import { serializeToQueryString } from 'helpers/misc';
import { createTransformer } from 'mobx-utils';
import CONSTANTS from 'helpers/constants';
import { getFcmToken } from 'helpers/firebase';

export class Users extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  @observable uuId = null;
  @observable display_image = null;
  @observable activeUsers = [];

  @action
  addActiveUser(user) {
    this.activeUsers.push(user);
  }

  @action.bound
  clearActiveUsers() {
    this.activeUsers.clear();
  }

  @action
  setDisplayImage(imageUrl) {
    this.display_image = imageUrl;
  }

  // getActiveUsers = createTransformer((_params) => {
  //     return Object.values(this.datum).filter(
  //         (user) => user.status === "Active"
  //     );
  // });

  fetchActiveUsers = flow(function* () {
    this.clearActiveUsers();
    let response = yield this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/users?status=Active`,
    )
      .then((r) => r.json())
      .then((r) => r.data);
    response.forEach((user) => {
      this.addActiveUser(user);
    });
    return response;
  });

  async fetchActiveUsersQuery() {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/users?status=Active`,
    ).then((r) => r.json());
    if (!response.success) {
      throw Error(
        response.error.DetailedMessage ||
          'An unexpected error occurred while attempting to update the task',
      );
    } else {
      return response.data;
    }
  }

  async listApiHandler() {
    let response = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/users`)
      .then((r) => r.json())
      .then((r) => r.data);
    return response;
  }

  async inviteUser(args) {
    try {
      const response = await this._inviteUserAPI({
        email: args.email,
        status: 'Invited',
        account_type: args.accountType,
        phone_access: args.canCall,
        permissions: args.permissions,
      });
      return response;
    } catch (err) {
      if (err.message.includes('already exists')) {
        throw Error('User with the entered email address already exists');
      } else {
        throw Error(
          'An unexpected error occurred while attempting to invite the user',
        );
      }
    }
  }

  async updateDisplaySidebar(status) {
    try {
      if (status === null) {
        throw Error(
          'There was an error trying to update the sidebar - There is no status to update',
        );
      }
      const response = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/users`, {
        method: 'PUT',
        body: JSON.stringify({
          display_sidebar: status,
        }),
      }).then((response) => response.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the sidebar',
        );
      }
    } catch (err) {
      throw Error(
        `There was an error trying to update the sidebar: ${JSON.stringify(
          err,
        )}`,
      );
    }
  }

  async _inviteUserAPI({
    email,
    status,
    account_type,
    phone_access,
    permissions,
  }) {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/users/invite`,
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          status,
          account_type,
          phone_access,
          permissions,
        }),
      },
    ).then((res) => res.json());
    if (!response.success) {
      if (response.error?.DetailedMessage.includes('already exists')) {
        throw Error('User with the entered email address already exists');
      } else {
        throw Error(
          'An unexpected error occurred while attempting to invite the user',
        );
      }
    } else {
      return response;
    }
  }

  @observable resendInviteReqs = [];

  inviteResend = flow(function* (args) {
    try {
      if (this.resendInviteReqs.indexOf(args.email) === -1) {
        this.resendInviteReqs.push(args.email);
        yield this._inviteResendAPI({ email: args.email });
        this.notification.showSuccess('Invite resent successfully.');
      }
    } catch (e) {
      console.error(e);
      this.notification.showError(
        `An unexpected error occurred while attempting to resend the invite`,
      );
    } finally {
      let index = this.resendInviteReqs.indexOf(args.email);
      if (index !== -1) {
        this.resendInviteReqs.splice(index, 1);
      }
    }
  });

  async _inviteResendAPI({ email }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/invite/resend`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }).then((response) => {
      if (response.status !== 200)
        throw Error(
          'An unexpected error occurred while attempting to resend the invite',
        );
      return response.json();
    });
  }

  changeDeactivateUserStatus = flow(function* (id, status = 'Inactive') {
    yield this._changeDeactivateUserStatusAPI({
      user_id: id,
      status: status,
    });
    yield this.fetchList();
  });

  async _changeDeactivateUserStatusAPI({ user_id = [], status }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/status`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        status,
      }),
    }).then((response) => response.json());
  }

  changeUserStatus = flow(function* (args) {
    yield this._changeUserStatusAPI({
      user_id: args.user_id,
      status: args.labelName,
    });
    if (args.user_id === this.store.authentication.user.user_id) {
      this.store.authentication.refreshUser();
    }
    yield this.fetchList();
  });

  async _changeUserStatusAPI({ user_id, status }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/status`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        status,
      }),
    }).then((response) => response.json());
  }

  changeUserRole = flow(function* (args) {
    yield this._changeUserRoleAPI({
      user_id: args.user_id,
      account_type: args.roleName,
    });
    if (args.user_id === this.store.authentication.user.user_id) {
      this.store.authentication.refreshUser();
    }
    yield this.fetchList();
  });

  async _changeUserRoleAPI({ user_id, account_type }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/role`, {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        account_type,
      }),
    }).then((response) => response.json());
  }

  userRegistration = flow(function* (args) {
    yield this._userUpdateAPI({
      user_id: this.store.authentication.user.user_id,
      username: args.username,
      status: 'Active',
      email: args.user_id,
      display_image: this.display_image,
    });
    this.store.authentication.user = yield this.userMe({});
  });

  userUpdate = flow(function* (args) {
    console.log('args', args);
    yield this._userUpdateAPI({
      ...args,
    });
  });

  async _userUpdateAPI({
    user_id,
    status,
    account_type,
    username,
    email,
    phone_access,
    display_image,
  }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users`, {
      method: 'PUT',
      body: JSON.stringify({
        user_id,
        status,
        username,
        account_type,
        email,
        phone_access,
        display_image,
      }),
    }).then((response) => response.json());
  }

  userImageUpload = flow(function* (file, username, user_id) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = 'profile_picture';
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
      if (response.uuid) {
        yield this.userUpdate({
          user_id,
          username,
          display_image: response.uuid,
        });
      }
      return response;
    } catch (err) {
      console.error(err);
      throw Error(err);
    }
  });

  downloadUserImage = flow(function* (uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/${uuid}/download`,
      ).then((res) => res.json());
      this.setDisplayImage(response.url);
      // return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  deleteUserImage = flow(function* (username, user_id) {
    try {
      yield this.userUpdate({ user_id, username, display_image: '' });
    } catch (e) {
      throw Error(e);
    }
  });

  userMe = flow(function* (_args) {
    let user = yield this._userMe();
    return user;
  });

  async _userMe() {
    let result = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/me`, {
      method: 'POST',
    }).then((r) => r.json());

    return result.data;
  }

  getUserByUserId = createTransformer(({ userId }) => {
    if (userId) {
      return Object.values(this.datum).find(
        (user) => user.user_id && user.user_id === userId,
      );
    } else {
      return null;
    }
  });

  sendNotification = async (message, userIds) => {
    let result = await this.fetch(
      `${CONSTANTS.NOTIFIER_API_URL}/notifications/send`,
      {
        method: 'POST',
        body: JSON.stringify({ message, userIds, type: 'OFFICE_CHAT_KITTY' }),
      },
    ).then((r) => r.json());

    return result.data;
  };

  getUserById = createTransformer((id) => {
    if (id) {
      return Object.values(this.datum).find(
        (user) => user.id && user.id === id,
      );
    } else {
      return null;
    }
  });

  notificationSubscribe = flow(function* (_args) {
    let data = yield this._notificationSubscribe();
    return data;
  });

  notificationUnsubscribe = flow(function* (_args) {
    let data = yield this._notificationUnsubscribe();
    return data;
  });

  async _notificationSubscribe() {
    let token = await getFcmToken();
    console.log('token for subscribe', token);
    if (token) {
      let result = await this.fetch(
        `${CONSTANTS.NOTIFIER_API_URL}/notifications/subscribe`,
        {
          method: 'POST',
          body: JSON.stringify({ token, type: 'fcm', device: 'web' }),
        },
      ).then((r) => r.json());

      return result.data;
    }
  }

  async _notificationUnsubscribe() {
    let token = await getFcmToken();
    if (token) {
      let result = await this.fetch(
        `${CONSTANTS.NOTIFIER_API_URL}/notifications/unsubscribe`,
        {
          method: 'POST',
          body: JSON.stringify({ token }),
        },
      ).then((r) => r.json());

      return result.data;
    }
  }

  async getUsersWithPhoneAccess() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the users',
        );
      } else {
        let hardwarePhones = [];
        let generalUsers = [];
        response.data.forEach((user) => {
          if (!user.phoneAccess) return;
          if (user?.mac_address?.length) {
            hardwarePhones.push(user);
          } else {
            generalUsers.push(user);
          }
        });
        return [...generalUsers, ...hardwarePhones];
      }
    } catch (err) {
      throw Error(err);
    }
  }

  /**
   *
   * @param {string} userId
   * @param {boolean} phoneAccess
   */
  async updatePhoneAccess(userId, phoneAccess) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${userId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            phoneAccess,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          `An unexpected error occurred while attempting to change the call permission`,
        );
      } else {
        const { data } = response;
        const { userUuid: user_id, phoneAccess: changedAccess } = data;
        return data;
      }
    } catch (err) {
      throw Error(err);
    }
  }
}
