import { flow, observable, action } from "mobx";
import { createTransformer } from "mobx-utils";
import moment from "moment-timezone";

import Resource from "./utils/resource";
import CONSTANTS from "helpers/constants";

export class PhoneFaxSchedule extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }
  currentlyPlaying = {
    uuid: null,
    shouldPlay: false,
    downloadUrl: null,
    file: null,
    id: null,
  };

  @action.bound
  setCurrentlyPlaying({
    uuid = this.currentlyPlaying.uuid,
    shouldPlay = this.currentlyPlaying.shouldPlay,
    downloadUrl = this.currentlyPlaying.downloadUrl,
    file = this.currentlyPlaying.file,
    id = this.currentlyPlaying.id,
  }) {
    this.currentlyPlaying = {
      uuid,
      shouldPlay,
      downloadUrl,
      file,
      id,
    };
  }

  async listApiHandler() {
    const response = await this.fetch(
      `${CONSTANTS.CALL_CONTROL_API_URL}/vacation`
    )
      .then((res) => res.json())
      .then((res) => res.data);
    return response;
  }

  addSchedule = flow(function* (from, to, label, greeting) {
    try {
      yield this.fetch(`${CONSTANTS.CALL_CONTROL_API_URL}/vacation`, {
        method: "POST",
        body: JSON.stringify({
          from,
          to,
          label,
          greeting,
        }),
      }).then((res) => res.json());
      yield this.store.authentication.refreshUser();
      yield this.fetchList();
    } catch (e) {
      throw Error(e);
    }
  });

  removeSchedule = flow(function* (id) {
    try {
      yield this.fetch(`${CONSTANTS.CALL_CONTROL_API_URL}/vacation/${id}`, {
        method: "DELETE",
      }).then((res) => res.json());
      yield this.store.authentication.refreshUser();
      yield this.fetchList();
    } catch (e) {
      throw Error(e);
    }
  });

  updateSchedule = flow(function* (id, from, to, label, greeting) {
    try {
      yield this.fetch(`${CONSTANTS.CALL_CONTROL_API_URL}/vacation/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          from,
          to,
          label,
          greeting,
        }),
      }).then((res) => res.json());
      yield this.store.authentication.refreshUser();
      yield this.fetchList();
    } catch (e) {
      throw Error(e);
    }
  });

  compareTime = createTransformer(({ id, timezone, current, past }) => {
    let schedule = Object.values(this.datum).find((s) => s.id === id);
    if (schedule) {
      if (current) {
        const scheduleDateTime = moment.utc(schedule.to).tz(timezone);
        const currentDateTime = moment().tz(timezone);
        return moment(scheduleDateTime).isSameOrAfter(currentDateTime, "day");
        // return moment.utc(schedule.to).tz(timezone).isSameOrAfter() .format("MM/DD/YYYY") >= moment().tz(timezone).format("MM/DD/YYYY");
      } else if (past) {
        const scheduleDateTime = moment.utc(schedule.to).tz(timezone);
        const currentDateTime = moment().tz(timezone);
        return moment(scheduleDateTime).isBefore(currentDateTime, "day");
        // return moment.utc(schedule.to).tz(timezone).format("MM/DD/YYYY") < moment().tz(timezone).format("MM/DD/YYYY");
      }
    }
  });
}
