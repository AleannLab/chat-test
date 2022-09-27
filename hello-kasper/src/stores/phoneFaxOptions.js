import { observable, action, flow } from "mobx";

import Resource from "./utils/resource";
import CONSTANTS from "helpers/constants";
import { serializeToQueryString } from "helpers/misc";

export class PhoneFaxOptions extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }
  schedules = [];
  timingsSet = false;
  empty = true;
  emptyCount = 0;
  schedule = {};
  scheduleAdded = false;
  configOptions = [];
  recordingOptions = {};

  @action
  resetConfigOptions() {
    this.configOptions.clear();
  }

  @action.bound
  setConfig(option) {
    this.configOptions = [...option];
  }

  @action.bound
  setSchedule(schedule) {
    this.schedule = schedule;
  }

  @action.bound
  setScheduleAdded(value) {
    this.scheduleAdded = value;
  }

  @action.bound
  setRecordingOptions(value) {
    this.recordingOptions = value;
  }

  fetchConfig = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/config`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the options"
        );
      } else {
        /**
         * When new office is created, the response is an empty array. To avoid showing skeleton indefinitely set some default options
         */
        if (response.data.length === 0) {
          this.setConfig([
            {
              config: "away_greeting_play",
              value: "never",
            },
            {
              config: "open_hours",
              value: "24_7",
            },
          ]);
        } else {
          this.setConfig(response.data);
          return response.data;
        }
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the options"
      );
    }
  });

  updateConfig = flow(function* (newConfig) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/config`,
        {
          method: "POST",
          body: JSON.stringify(newConfig),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the options"
        );
      }
      yield this.store.authentication.refreshUser();
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the options"
      );
    }
  });

  fetchSchedule = flow(function* () {
    try {
      // this.setScheduleAdded(false);
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-schedule`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the schedule"
        );
      } else {
        this.fillData(response.data);
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the schedule"
      );
    }
  });

  @action
  fillData(data) {
    const days = [
      { 0: "Sunday" },
      { 1: "Monday" },
      { 2: "Tuesday" },
      { 3: "Wednesday" },
      { 4: "Thursday" },
      { 5: "Friday" },
      { 6: "Saturday" },
    ];
    let newSchedule = {
      Sunday: { id: 0, timings: [], timingsCount: 0 },
      Monday: { id: 1, timings: [], timingsCount: 0 },
      Tuesday: { id: 2, timings: [], timingsCount: 0 },
      Wednesday: { id: 3, timings: [], timingsCount: 0 },
      Thursday: { id: 4, timings: [], timingsCount: 0 },
      Friday: { id: 5, timings: [], timingsCount: 0 },
      Saturday: { id: 6, timings: [], timingsCount: 0 },
    };
    data.forEach((schedule) => {
      newSchedule[days[schedule.day][schedule.day]].timings = [
        ...newSchedule[days[schedule.day][schedule.day]].timings,
        {
          id: schedule.id,
          fromTime: schedule.from,
          toTime: schedule.to,
        },
      ];
      newSchedule[days[schedule.day][schedule.day]].timingsCount =
        newSchedule[days[schedule.day][schedule.day]].timings.length;
    });
    this.setSchedule(newSchedule);
    this.setScheduleAdded(true);
  }

  createNewSchedule = flow(function* (scheduleInfo) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-schedule`,
        {
          method: "POST",
          body: JSON.stringify(scheduleInfo),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to add the schedule"
        );
      }
    } catch (err) {
      console.error(err);
      throw Error(
        "An unexpected error occurred while attempting to add the schedule"
      );
    }
  });

  deleteSchedules = flow(function* ({ ids }) {
    try {
      if (ids.length > 1) {
        this.notification.showInfo("Deleting schedules");
      } else {
        this.notification.showInfo("Deleting schedule");
      }
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office-schedule`,
        {
          method: "DELETE",
          body: JSON.stringify({ ids }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to delete the schedule(s)"
        );
      } else {
        yield this.fetchSchedule();
        this.notification.hideNotification();
      }
    } catch (err) {
      console.error(err);
      throw Error(
        "An unexpected error occurred while attempting to delete the schedule(s)"
      );
    }
  });

  @action
  async addNewSchedule(schedule) {
    let newSchedule = {};
    let days = [];
    let from = "";
    let to = "";

    Object.entries(schedule).forEach(([key, value]) => {
      if (key === "fromTime") {
        from = schedule[key];
      } else if (key === "toTime") {
        to = schedule[key];
      } else if (schedule[key].added === true) {
        days.push(schedule[key].id);
        newSchedule[key] = [
          {
            timeAdded: true,
            fromTime: schedule.fromTime,
            toTime: schedule.toTime,
          },
        ];
      } else if (schedule[key].added === false) {
        newSchedule[key] = [];
      }
    });
    const scheduleInfo = {
      days: days,
      from: from,
      to: to,
    };
    try {
      await this.createNewSchedule(scheduleInfo);
      await this.fetchSchedule();
    } catch (e) {
      throw Error(e.message);
    }
  }

  fetchRecordingOptions = flow(function* (uuid) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office/number/settings/${uuid}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the recording options"
        );
      } else {
        const { record_call, play_recording_alert } = response.data;
        this.setRecordingOptions({
          callRecording: record_call,
          playDisclaimer: play_recording_alert,
        });
        return response.data;
      }
    } catch (e) {
      throw "An unexpected error occurred while fetching settings";
    }
  });

  fetchGreetings = flow(function* (type) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/greeting${serializeToQueryString(
          type
        )}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the greeting list"
        );
      }
      return response.data;
    } catch (e) {
      throw "An unexpected error occurred while fetching settings";
    }
  });

  updateRecordingOptions = flow(function* (options) {
    const Id = options.id;
    const Method = options.method;
    const numberUuid = options.uuid;
    const mutationObject = { ...options, numberUuid };
    delete mutationObject.id;
    delete mutationObject.method;
    delete mutationObject.uuid;
    Method !== "POST" && delete mutationObject.numberUuid;
    const suffix =
      Method !== "POST"
        ? `office/number/setting/${Id}`
        : `office/number/setting/${numberUuid}`;

    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/${suffix}`,
        {
          method: Method,
          body: JSON.stringify(mutationObject),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the recording options"
        );
      }
      return response;
    } catch (e) {
      throw "An unexpected error occurred while updating settings";
    }
  });
}
