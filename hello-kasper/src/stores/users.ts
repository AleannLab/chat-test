import Resource from "./utils/resource";
import { serializeToQueryString } from "../helpers/misc";
import CONSTANTS from "../helpers/constants";
import { getFcmToken } from "../helpers/firebase";

export class Users extends Resource {
  store: any;
  constructor(store: any) {
    super(store);
    this.store = store;
  }

  uuId = null;
  display_image = null;
  activeUsers = [];

  addActiveUser(user) {
    this.activeUsers.push(user);
  }

  setDisplayImage(imageUrl) {
    this.display_image = imageUrl;
  }

  async fetchActiveUsers() {
    let response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/users?status=Active`
    )
      .then((r) => r.json())
      .then((r) => r.data);
    response.forEach((user) => {
      this.addActiveUser(user);
    });
    return response;
  }

  async fetchActiveUsersQuery() {
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/users?status=Active`
    ).then((r) => r.json());
    if (!response.success) {
      throw Error(
        response.error.DetailedMessage ||
          "An unexpected error occurred while attempting to update the task"
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
        status: "Invited",
        account_type: args.accountType,
        phone_access: args.canCall,
        permissions: args.permissions,
      });
      return response;
    } catch (err) {
      if (err.message.includes("already exists")) {
        throw Error("User with the entered email address already exists");
      } else {
        throw Error(
          "An unexpected error occurred while attempting to invite the user"
        );
      }
    }
  }

  async updateDisplaySidebar(status) {
    try {
      if (status === null) {
        throw Error(
          "There was an error trying to update the sidebar - There is no status to update"
        );
      }
      const response = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/users`, {
        method: "PUT",
        body: JSON.stringify({
          display_sidebar: status,
        }),
      }).then((response) => response.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the sidebar"
        );
      }
    } catch (err) {
      throw Error(
        `There was an error trying to update the sidebar: ${JSON.stringify(
          err
        )}`
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
        method: "POST",
        body: JSON.stringify({
          email,
          status,
          account_type,
          phone_access,
          permissions,
        }),
      }
    ).then((res) => res.json());
    if (!response.success) {
      if (response.error?.DetailedMessage.includes("already exists")) {
        throw Error("User with the entered email address already exists");
      } else {
        throw Error(
          "An unexpected error occurred while attempting to invite the user"
        );
      }
    } else {
      return response;
    }
  }

  resendInviteReqs = [];

  async changeDeactivateUserStatus(id, status = "Inactive") {
    await this._changeDeactivateUserStatusAPI({
      user_id: id,
      status: status,
    });
  }

  async _changeDeactivateUserStatusAPI({ user_id = [], status }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/status`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        status,
      }),
    }).then((response) => response.json());
  }

  async changeUserStatus(args) {
    await this._changeUserStatusAPI({
      user_id: args.user_id,
      status: args.labelName,
    });
    if (args.user_id === this.store.authentication.user.user_id) {
      this.store.authentication.refreshUser();
    }
  }

  async _changeUserStatusAPI({ user_id, status }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/status`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        status,
      }),
    }).then((response) => response.json());
  }

  async changeUserRole(args) {
    await this._changeUserRoleAPI({
      user_id: args.user_id,
      account_type: args.roleName,
    });
    if (args.user_id === this.store.authentication.user.user_id) {
      this.store.authentication.refreshUser();
    }
  }

  async _changeUserRoleAPI({ user_id, account_type }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/role`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        account_type,
      }),
    }).then((response) => response.json());
  }

  async userRegistration(args) {
    await this._userUpdateAPI({
      user_id: this.store.authentication.user.user_id,
      username: args.username,
      status: "Active",
      email: args.user_id,
      display_image: this.display_image,
    });
    this.store.authentication.user = await this.userMe({});
  }

  async userUpdate(args) {
    await this._userUpdateAPI({
      ...args,
    });
  }

  async _userUpdateAPI({
    user_id,
    status,
    account_type,
    username,
    email,
    phone_access,
    display_image,
  }: any) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users`, {
      method: "PUT",
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

  async userImageUpload(file, username, user_id) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = "profile_picture";
      const patient_id = 0;
      const did = "";
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        did,
      });
      const response = await this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`
      ).then((res) => res.json());
      if (response.uuid) {
        await this.userUpdate({
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
  }

  async downloadUserImage(uuid) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/${uuid}/download`
      ).then((res) => res.json());
      this.setDisplayImage(response.url);
      // return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  }

  async deleteUserImage(username, user_id) {
    try {
      await this.userUpdate({ user_id, username, display_image: "" });
    } catch (e) {
      throw Error(e);
    }
  }

  async userMe(_args) {
    let user = await this._userMe();
    console.log("user", user);

    return user;
  }

  async _userMe() {
    let result = await this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/me`, {
      method: "POST",
    }).then((r) => {
      return r.json();
    });

    return result.data;
  }

  async sendNotification(message, userIds) {
    let result = await this.fetch(
      `${CONSTANTS.NOTIFIER_API_URL}/notifications/send`,
      {
        method: "POST",
        body: JSON.stringify({ message, userIds, type: "OFFICE_CHAT_KITTY" }),
      }
    ).then((r) => r.json());

    return result.data;
  }

  async notificationSubscribe(_args) {
    let data = await this._notificationSubscribe();
    return data;
  }

  async notificationUnsubscribe(_args) {
    let data = await this._notificationUnsubscribe();
    return data;
  }

  async _notificationSubscribe() {
    let token = await getFcmToken();
    console.log("token for subscribe", token);
    if (token) {
      let result = await this.fetch(
        `${CONSTANTS.NOTIFIER_API_URL}/notifications/subscribe`,
        {
          method: "POST",
          body: JSON.stringify({ token, type: "fcm", device: "web" }),
        }
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
          method: "POST",
          body: JSON.stringify({ token }),
        }
      ).then((r) => r.json());

      return result.data;
    }
  }

  async getUsersWithPhoneAccess() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the users"
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

  async updatePhoneAccess(userId, phoneAccess) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            phoneAccess,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          `An unexpected error occurred while attempting to change the call permission`
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
