import Resource from "./utils/resource";
import { observable, action } from "mobx";
import CONSTANTS from "helpers/constants";

export class NotificationSettings extends Resource {
  showDotIcon = false;
  notifyData = {};
  notificationIntervalId = null;
  notificationIntervalPopupId = null;
  notificationSettingFlag = false;

  constructor(store) {
    super(store);
    this.store = store;
  }

  @action
  setNotificationAlert(val) {
    this.notificationAlert = val;
  }

  @action.bound
  setShowDotIcon = (showDotIcon) => {
    this.showDotIcon = showDotIcon;
  };

  @action.bound
  setNotifyData(value) {
    this.notifyData = value;
  }

  async fetchNotificationData(user_id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-setting/${user_id}`,
        { method: "GET" }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the notification data!"
        );
      } else {
        this.setNotifyData(response.data);
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }

  async updateNotificationData(notifyData, notificationEnable) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/notification-setting`,
        {
          method: "PUT",
          body: JSON.stringify(notifyData),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to update the notification settings!"
        );
      } else {
        if (notificationEnable !== false) {
          this.notification.showSuccess(
            `Notification settings are updated successfully`
          );
        }
        if (this.notificationIntervalId !== null) {
          clearInterval(this.notificationIntervalId);
          this.notificationIntervalId = null;
        }
        if (this.notificationIntervalPopupId !== null) {
          clearInterval(this.notificationIntervalPopupId);
          this.notificationIntervalPopupId = null;
        }
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }
}
