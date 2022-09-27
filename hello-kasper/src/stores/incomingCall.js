import { flow, observable } from "mobx";

import CONSTANTS from "helpers/constants";
import { serializeToQueryString } from "helpers/misc";
import Resource from "./utils/resource";

export class IncomingCall extends Resource {
  userData = [];

  fetchActivePhoneUsers = flow(function* () {
    try {
      const phoneAccess = true;
      const status = "Active";
      const deleted = false;
      const queryString = serializeToQueryString({
        phoneAccess,
        status,
        deleted,
      });
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/users${queryString}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the users with phone access"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the users with phone access"
      );
    }
  });

  fetchHardwarePhoneUsers = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the users with phone access"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the users with phone access"
      );
    }
  });

  fetchData = flow(function* () {
    try {
      const activePhoneData = yield this.fetchActivePhoneUsers();
      const hardwareData = yield this.fetchHardwarePhoneUsers();
      const combined = activePhoneData.concat(hardwareData);
      this.userData.replace(combined);
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the users with phone access"
      );
    }
  });

  changePhoneCallsPermission = flow(function* ({ user_id, incoming_calls }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/users/setphoneaccess`,
        {
          method: "POST",
          body: JSON.stringify({
            user_id,
            incoming_calls,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to change the permission"
        );
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to change the permission"
      );
    }
  });

  changeHardwarePhoneCallsPermission = flow(function* ({ id, incoming_calls }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/hardware-phone/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            incoming_calls,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to change the permission"
        );
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to change the permission"
      );
    }
  });
}
