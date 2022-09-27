import Resource from "./utils/resource";
import { observable, action } from "mobx";
import CONSTANTS from "helpers/constants";

export class PaperlessAutomation extends Resource {
  automationFormData = {};
  constructor(store) {
    super(store);
    this.store = store;
  }

  async fetchFormAutomationData() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/paperless-automation/`,
        { method: "GET" }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the automation data!"
        );
      } else {
        this.automationFormData = response.data;
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }

  async addAndUpdateFormAutomation(automationData) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/paperless-automation`,
        {
          method: "PUT",
          body: JSON.stringify(automationData),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to Add the Automation data !"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }

  async updateAutomationSetting(automationSettingData) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/paperless-automation/setting`,
        {
          method: "PUT",
          body: JSON.stringify(automationSettingData),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to Update the Paperless Automation Setting !"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }
}
