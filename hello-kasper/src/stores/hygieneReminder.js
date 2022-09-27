import CONSTANTS from "helpers/constants";
import { action, observable } from "mobx";
// import CONSTANTS from "helpers/constants";
import Resource from "./utils/resource";

export class HygieneReminder extends Resource {
  reminderData = [];
  recallTypeData = [];
  temporaryEmailReminder = {
    id: "",
    reminderName: "",
    dueDate: "",
    durationType: "",
    period: "",
    customMessage: "",
    type: "",
    sentCount: "",
    isEnabled: "",
  };

  @action
  setReminderData({
    reminderName,
    dueDate,
    durationType,
    period,
    customMessage,
    reminderType,
  }) {
    this.reminderData.push({
      id: this.reminderData.length + 1,
      reminderName,
      dueDate,
      durationType,
      period,
      customMessage,
      type: reminderType,
      sentCount: 0,
      isEnabled: false,
    });
  }

  async editReminder({ id, ...val }) {
    // api call when apis are available
    this.loading = true;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            ...val,
          }),
        }
      );

      let res = await response.json();

      this.loading = false;
      if (!res.success) {
        throw Error(
          "An unexpected error occurred while attempting to delete reminder"
        );
      }
    } catch (e) {
      this.loading = false;
      throw Error(
        "An unexpected error occurred while attempting to delete reminder"
      );
    }
  }

  @action
  setTemporaryEmailReminder({
    reminderName,
    dueDate,
    durationType,
    period,
    modifiedCustomMessage,
    customMessage,
  }) {
    /**
     * modifiedCustomMessage is used for templating
     * customMessage is used for previewing
     */
    this.temporaryEmailReminder = {
      id: this.reminderData.length + 1,
      reminderName,
      dueDate,
      durationType,
      period,
      modifiedCustomMessage,
      customMessage,
      type: "Email",
      sentCount: 0,
      isEnabled: false,
    };
  }

  async deleteReminder(id) {
    this.loading = true;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config/${id}`,
        {
          method: "DELETE",
        }
      );

      let res = await response.json();

      this.loading = false;
      if (!res.success) {
        throw Error(
          "An unexpected error occurred while attempting to delete reminder"
        );
      }
    } catch (e) {
      this.loading = false;
      throw Error(
        "An unexpected error occurred while attempting to delete reminder"
      );
    }
  }

  /**
   * Get hygiene reminders
   */
  async fetchReminders() {
    this.loading = true;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config?reminder_types=hygiene`
      );

      let res = await response.json();

      this.loading = false;
      if (!res.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch reminders"
        );
      } else {
        let mappedData = [];
        for (let row of res.data) {
          mappedData.push(row);
        }
        console.log("mappedData", mappedData);
        return mappedData;
      }
    } catch (e) {
      this.loading = false;
      throw Error(e);
    }
  }

  // Add Hygiene Reminders
  async addReminder(val) {
    this.loading = true;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/reminder-config`,
        {
          method: "POST",
          body: JSON.stringify({
            ...val,
          }),
        }
      );

      let res = await response.json();
      console.log("res", res);
      this.loading = false;
      if (!res.success) {
        throw Error(
          "An unexpected error occurred while attempting to add reminder"
        );
      } else {
        return res.data;
      }
    } catch (e) {
      this.loading = false;
      throw Error(e);
    }
  }

  async fetchRecallTypeData() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/recall-type`,
        { method: "GET" }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the notification data!"
        );
      } else {
        this.recallTypeData = response.data;
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }
}
