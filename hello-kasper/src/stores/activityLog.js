import { action, observable } from "mobx";
import { serializeToQueryString } from "../helpers/misc";
import CONSTANTS from "../helpers/constants";
import { useQuery } from "react-query";
import { SingleSelectableResource } from "./utils/SingleSelectableResource";

export const LOGS_ENDPOINTS = {
  calls: "/calls",
  voicemail: "/voicemail",
  faxes: "/faxes",
};

const getEndpoint = (logType, hasRecording) => {
  switch (logType) {
    case 2: // Incoming Calls
    case 3: // Outgoing Calls
      return LOGS_ENDPOINTS.calls;

    case 4: // Missed Calls
      return hasRecording ? LOGS_ENDPOINTS.voicemail : LOGS_ENDPOINTS.calls;

    case 5: // Voicemails
      return LOGS_ENDPOINTS.voicemail;

    case 6: // Incoming Faxes
    case 7: // Outgoing Faxes
      return LOGS_ENDPOINTS.faxes;

    default:
      // calls
      return LOGS_ENDPOINTS.calls;
  }
};

export class ActivityLog extends SingleSelectableResource {
  queryKeys = {
    unseenCounts: "voip-unseen-counts",
    callLogs: "call-logs",
    voicemailLogs: "voicemail-logs",
    faxLogs: "fax-logs",
    activityCallLogs: "activity-call-logs",
    activityLogs: "activity-logs",
  };

  constructor(store) {
    super(store);
    this.store = store;
  }

  initialSelection = true;
  selectedActivity = {};

  setInitialSelection(value) {
    this.initialSelection = value;
  }

  setSelectedActivity(value) {
    this.selectedActivity = value;
    // this.markLogAsSeen(value);
  }

  async listApiHandler(params, logTypeParam, isActivity = true) {
    const endpoint = isActivity ? "/activity" : "";

    // Get data from the VoIP API and format in the correct format for the UI
    let callsAndFaxes = await this.fetch(
      `${
        CONSTANTS.VOIP_API_URL
      }${endpoint}${logTypeParam}${serializeToQueryString({
        ...params,
      })}`
    ).then((r) => r.json());

    callsAndFaxes = await Promise.all(
      callsAndFaxes.map(async (x) => {
        return {
          ...x,
          log_type_id: x.log_type_id ? x.log_type_id : Number(params.logType),
          phone_no: x.direction === "IN" ? x.from_did : x.to_did,
          datetime: x.datetime
            ? x.datetime
            : x.end_datetime
            ? x.end_datetime
            : x.start_datetime,
          id: x.uuid,
          media_uuid: x.media_uuid ? x.media_uuid : x.recording_media_uuid,
        };
      })
    );

    // Get a unique list of phone numbers we just retrieved from the previous API call
    const uniquePhoneNumbers = [
      ...new Set(await Promise.all(callsAndFaxes.map(async (x) => x.phone_no))),
    ];

    // Retrieve the list of names from the list of phone numbers
    try {
      const patientNames = await this.fetch(
        `${
          CONSTANTS.OFFICE_API_URL
        }/patients/phoneno?phone_no_list=${encodeURIComponent(
          uniquePhoneNumbers.join(",")
        )}`
      ).then((r) => r.json());

      callsAndFaxes = Promise.all(
        await callsAndFaxes.map(async (x) => {
          let y = patientNames.data.find((z) => z.phone_no === x.phone_no);
          return { ...x, ...y };
        })
      );
    } catch (err) {
      console.error(err);
    }

    return callsAndFaxes;
  }

  async printActivityLogs(params, logTypeParam) {
    const endpoint = "/print-logs";
    const url = `${
      CONSTANTS.VOIP_API_URL
    }${logTypeParam}${endpoint}${serializeToQueryString({ ...params })}`;
    try {
      const response = await this.fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `kasper-activity-logs.${params.file_type}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return blob;
    } catch (error) {
      this.store.notification.showError(
        "Something went wrong while attempting to generate the file. Please narrow down your search and try again."
      );
      console.error(error);
      return error;
    }
  }

  fetchUnseenCounts() {
    return this.fetch(`${CONSTANTS.VOIP_API_URL}/activity/unseen-count`).then(
      (res) => res.json()
    );
  }

  useUnseenCounts() {
    return useQuery([this.queryKeys.unseenCounts], () =>
      this.fetchUnseenCounts()
    );
  }

  // for Seen Mutations (Newer Implementation)
  onSelectLog = action(() => {
    const selected = this.selectedActivity;
    if (!selected || selected.seen) return;
    const endpoint = getEndpoint(selected.log_type_id, selected.media_uuid);
    if (endpoint === "/activity") return;

    this.fetch(`${CONSTANTS.VOIP_API_URL}${endpoint}/${selected.uuid}/seen`, {
      method: "PATCH",
    });
  });

  markAllAsSeen = async (logTypeParam, params = {}) => {
    try {
      this.loading = true;
      const res = await this.fetch(
        `${CONSTANTS.VOIP_API_URL}${logTypeParam}/seen`,
        {
          method: "PATCH",
          body: JSON.stringify(params),
        }
      );
      this.store.dialer.triggerEvent("MarkAllAsSeen_MarkAllAsSeen");
      this.loading = false;
      return res.data;
    } catch (error) {
      console.log(error);
      this.store.notification.showError(
        "Something went wrong while attempting to Mark All Logs as Seen"
      );
    }
  };
  getActivityLogs = async (params, isVoipApiLog = false, logType = null) => {
    try {
      const endPoint = LOGS_ENDPOINTS[logType];
      const apiUrl =
        isVoipApiLog && logType
          ? `${CONSTANTS.VOIP_API_URL}/activity${endPoint}`
          : `${CONSTANTS.OFFICE_API_URL}/activity-log`;
      let logs = await this.fetch(
        `${apiUrl}${serializeToQueryString({
          ...params,
        })}`
      ).then((r) => r.json());

      logs = isVoipApiLog
        ? await Promise.all(logs.map(async (log) => log))
        : logs.data;

      return logs;
    } catch (error) {
      console.log(error);
    }
  };
}
