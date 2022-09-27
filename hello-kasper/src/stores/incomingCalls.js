import Resource from "./utils/resource";
import CONSTANTS from "helpers/constants";
import { flow, action, observable } from "mobx";

export class IncomingCalls extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  currentlyPlaying = {
    uuid: null,
    shouldPlay: false,
    downloadUrl: null,
    file: null,
  };

  schedulePayload = {};
  scheduleUid = "";

  @action.bound
  setSchedulePayload = (data) => {
    this.schedulePayload = data;
  };

  @action.bound
  setScheduleUid = (uid) => {
    this.scheduleUid = uid;
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

  async getNumbers() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office/numbers?numberType=VOICE`
      ).then((res) => res.json());

      return response?.data;
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the voice numbers"
      );
    }
  }
  async getFaxNumbers() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office/numbers?numberType=FAX`
      ).then((res) => res.json());

      return response?.data;
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the voice numbers"
      );
    }
  }

  async getUsers() {
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

  addSchedule = flow(function* (payload) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the schedule"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the schedule";
    }
  });

  addTimeSlot = flow(function* (payload) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });

  updateTimeSlot = flow(function* ({ id, ...rest }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(rest),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });
  updatePosition = flow(function* (payload) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/updatePosition`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });
  deleteTimeSlot = flow(function* ({ id, ...rest }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/${id}`,
        {
          method: "DELETE",
          body: JSON.stringify(rest),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });
  deleteScheduleSlotData = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/${id}`,
        {
          method: "DELETE",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });

  getScheduleSlotData = flow(function* ({ scheduleId, id }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/${scheduleId}/${id}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to add the Time Slot"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to add the Time Slot";
    }
  });

  updateSchedule = flow(function* ({ id, ...rest }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(rest),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to update the schedule"
        );
      }
    } catch (e) {
      console.error(e);
      throw "An unexpected error occurred while attempting to update the schedule";
    }
  });

  getScheduleById = flow(function* (uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule/${uuid}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the schedule"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the schedule";
    }
  });

  getScheduleSlots = flow(function* (uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-number-schedule-slot/${uuid}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the schedule"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the schedule";
    }
  });
  getForwardingNumbers = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/forwarding`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the numbers"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the numbers";
    }
  });

  getGroups = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/group`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the groups"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the groups";
    }
  });

  getGreetingTypes = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting-types`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the greetings"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the greetings";
    }
  });

  getGreetingsById = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting?greetingType=${id}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the greetings"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the greetings";
    }
  });

  getIvrList = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to fetch the ivr(s)"
        );
      }
    } catch (e) {
      throw "An unexpected error occurred while attempting to fetch the ivr(s)";
    }
  });

  getAgents = flow(function* () {
    try {
      const response = yield this.fetch(`${CONSTANTS.PBX_API_URL}/sip-peers`, {
        method: "GET",
      }).then((res) => res.json());
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
      throw "An unexpected error occurred while attempting to fetch the agents";
    }
  });

  changeIncomingAccess = flow(function* (args) {
    console.log("args", args);
    yield this._changeIncomingAccess({
      user_id: args.user_id,
      incoming_calls: args.changedAccess,
    });
    if (args.user_id === this.store.authentication.user.user_id) {
      this.store.authentication.refreshUser();
    }
    yield this.fetchList();
  });

  async _changeIncomingAccess({ user_id, incoming_calls }) {
    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/users/set-incoming-access`, {
      method: "POST",
      body: JSON.stringify({
        user_id,
        incoming_calls,
      }),
    }).then((response) => response.json());
  }

  /**
   *
   * @param {string} userId
   * @param {boolean} incomingCalls
   */
  async setIncomingCalls(userId, incomingCalls) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            incomingCalls,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          `An unexpected error occurred while attempting to change the call permission`
        );
      } else {
        const { data } = response;
        this.store.dialer.refreshInitDetails();
        return data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  /**
   *
   * @param {string} userId
   * @param {boolean} dndEnable
   */
  async setDnd(userId, dndEnable) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.PBX_API_URL}/sip-peers/${userId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            dndEnable,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          `An unexpected error occurred while attempting to change the call permission`
        );
      } else {
        const { data } = response;
        this.store.dialer.refreshInitDetails();
        return data;
      }
    } catch (err) {
      throw Error(err);
    }
  }

  /**
   *
   * @param {string[]} userIds
   */
  async fetchKasperDataForUsers(userIds) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/users?userIds=${userIds.join()}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          `An unexpected error occurred while attempting to change the call permission`
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(err);
    }
  }
}
