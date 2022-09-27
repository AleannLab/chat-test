import Resource from "./utils/resource";
import { action, flow, observable } from "mobx";
import CONSTANTS from "helpers/constants";

export class Trigger extends Resource {
  actions = new Map();

  @action.bound
  resetActions() {
    this.actions.clear();
  }

  @action.bound
  setActions({ actionSource, data }) {
    this.actions.set(actionSource, data);
  }

  async listApiHandler() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/automation?hidden=false`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the triggers"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      console.error(err);
      throw Error(
        "An unexpected error occurred while attempting to fetch the triggers"
      );
    }
  }

  fetchFormActions = flow(function* ({ actionSource }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group?archived=false&showEmpty=false`
      ).then((r) => r.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the actions"
        );
      } else {
        this.setActions({ actionSource, data: [...response.data] });
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the actions"
      );
    }
  });

  updateTriggerState = flow(function* ({ triggerId, enabled }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/automation/${triggerId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            enabled,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to change the trigger state"
        );
      }
    } catch (err) {
      throw Error(err.message);
    }
  });

  updateTriggerAction = flow(function* ({ actionId, triggerId }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/automation/${triggerId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            currentAction: actionId,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to change the action"
        );
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to change the action"
      );
    }
  });

  /**
   * Fetch appointment configs
   * @param {string} key
   * @returns {Object}
   */
  async getAutomationConfigByKey(key) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/automation/key/${key}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the automation configs"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update appointment configs
   * @param {number} id
   * @returns {Object}
   */
  async updateAutomationConfigById(id, config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/automation/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(config),
        }
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to update automation configs"
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }
}
