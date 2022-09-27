import { action, computed, flow, observable } from "mobx";
import { createTransformer } from "mobx-utils";
import moment from "moment-timezone";
import CONSTANTS, { AUTHORIZATION_TYPE } from "helpers/constants";
import { serializeToQueryString } from "helpers/misc";
import Resource from "./utils/resource";

export class OnlineSchedule extends Resource {
  dateTime = {
    date: new Date(),
    time: "",
    startDate: new Date(),
    endDate: new Date(),
  };
  practitionerData = {
    practitionerIds: [],
    selectedPractitioner: {},
  };
  appointmentConfig = {
    selectedAppointment: {
      available_for: "",
      id: null,
      label: null,
      value: null,
    },
    procedureTime: null,
    appointmentTypes: [],
    filteredAppointmentTypes: [],
  };
  paymentData = {
    selectedPaymentType: "",
    paymentTypes: [],
  };
  officeInformation = {
    timezone: "America/Chicago",
    address: "",
    name: "",
    brandColor: "#F4266E",
  };
  formStatus = {
    isSubmitting: false,
    isSubmitted: false,
  };
  patientType = "New";
  scheduleNow = false;
  vacations = [];
  practitionerBusyDays = {};
  practitionerBusyDaysCopy = {};
  slots = [];
  slotsCopy = [];
  disable = false;
  timeExpired = false;
  anyProvider = false;

  @action
  setDateTime({
    date = this.dateTime.date,
    time = this.dateTime.time,
    startDate = this.dateTime.startDate,
    endDate = this.dateTime.endDate,
  }) {
    this.dateTime = { date, time, startDate, endDate };
  }

  @action
  setPractitionerData({
    practitionerIds = this.practitionerData.practitionerIds,
    selectedPractitioner = this.practitionerData.selectedPractitioner,
  }) {
    this.practitionerData = {
      practitionerIds,
      selectedPractitioner,
    };
  }

  @action setAppointmentConfig({
    selectedAppointment = this.appointmentConfig.selectedAppointment,
    appointmentTypes = this.appointmentConfig.appointmentTypes,
    filteredAppointmentTypes = this.appointmentConfig.filteredAppointmentTypes,
    procedureTime = this.appointmentConfig.procedureTime,
  }) {
    this.appointmentConfig = {
      selectedAppointment,
      appointmentTypes,
      filteredAppointmentTypes,
      procedureTime,
    };
  }

  @action
  setPaymentData({
    selectedPaymentType = this.paymentData.selectedPaymentType,
    paymentTypes = this.paymentData.paymentTypes,
  }) {
    this.paymentData = { selectedPaymentType, paymentTypes };
  }

  @action
  setPatientType(type) {
    this.patientType = type;
  }

  @action
  setScheduleNow(value) {
    // if (value === false) {
    //   this.setPractitionerData({ selectedPractitioner: {} });
    //   this.setDateTime({ time: '' });
    // }
    this.scheduleNow = value;
  }

  @action
  setDisable(value) {
    this.disable = value;
  }

  @action
  setTimeExpired(value) {
    this.timeExpired = value;
  }

  @action
  setFormStatus({
    isSubmitting = this.formStatus.isSubmitting,
    isSubmitted = this.formStatus.isSubmitted,
  }) {
    this.formStatus = {
      isSubmitting,
      isSubmitted,
    };
  }

  @action
  setOfficeInformation({
    timezone = this.officeInformation.timezone,
    address = this.officeInformation.address,
    name = this.officeInformation.name,
    brandColor = this.officeInformation.brandColor,
  }) {
    this.officeInformation = { timezone, address, name, brandColor };
  }

  @action
  setAnyProvider(value) {
    this.anyProvider = value;
  }

  @action
  setPractitionerBusyDays(id, days) {
    this.practitionerBusyDays[id] = days;
    this.practitionerBusyDaysCopy[id] = days;
  }

  @computed get isPractitionerEmpty() {
    return Object.keys(this.practitionerData.selectedPractitioner).length === 0;
  }

  @computed get isSelectedAppointmentEmpty() {
    return this.appointmentConfig.selectedAppointment.id === null;
  }

  async fetchAppointmentTypes() {
    try {
      const params = {
        mapped: true,
        providerMapped: true,
      };
      const response = await this.fetch(
        `${
          CONSTANTS.OFFICE_API_URL
        }/public/appointment-type${serializeToQueryString(params)}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the appointments"
        );
      } else {
        let appointmentTypes = [];
        response.data.forEach((type) => {
          let available_for = "";
          if (type.new_patient && type.returning_patient) {
            available_for = "new_returning";
          } else if (type.new_patient && !type.returning_patient) {
            available_for = "new";
          } else if (!type.new_patient && type.returning_patient) {
            available_for = "returning";
          }
          /**
           * Only push in the array if it is of either or both of the types
           * If the appointment is disabled for both of the types, then do not push in the array
           */
          if (available_for !== "") {
            appointmentTypes.push({
              id: type.id,
              label: type?.display_name || type.name,
              available_for: available_for,
              value: type.code_string,
            });
          }
        });
        this.setAppointmentConfig({ appointmentTypes });
        this.filterAppointmentTypeByPatientType({
          patientType: this.patientType.toLowerCase(),
        });
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the appointments"
      );
    }
  }

  fetchPaymentTypes = flow(function* () {
    try {
      const params = {
        isActive: true,
      };
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/insurance${serializeToQueryString(
          params
        )}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch insurance information"
        );
      } else {
        this.setPaymentData({
          paymentTypes: response.data,
          selectedPaymentType: response.data[0].id,
        });
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch insurance information"
      );
    }
  });

  async fetchPractitionersMonthSchedule() {
    const params = {
      startDate: this.dateTime.startDate,
      endDate: this.dateTime.endDate,
      withSchedule: true,
      displayUrl: true,
      operatoryShouldExist: true,
    };
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/appointment-type-provider-mapping/${
          this.appointmentConfig.selectedAppointment.id
        }${serializeToQueryString(params)}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the providers and their schedule"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the providers and their schedule"
      );
    }
  }

  fetchOfficeInformation = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/office-config?${new URLSearchParams(
          {
            configs: [
              "office_name",
              "office_address",
              "office_profile_pic",
              "office_timezone",
              "office_brand_color",
            ].join(","),
          }
        ).toString()}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the office information"
        );
      } else {
        this.setOfficeInformation({
          timezone: response?.data?.office_timezone,
          address: response?.data?.office_address,
          name: response?.data?.office_name,
          brandColor: response?.data?.office_brand_color || "#F4266E",
        });
        this.setDateTime({
          startDate: moment()
            .tz(response.data.office_timezone)
            .startOf("month")
            .format("YYYY-MM-DD"),
          endDate: moment()
            .tz(response.data.office_timezone)
            .endOf("month")
            .format("YYYY-MM-DD"),
        });
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the office information"
      );
    }
  });

  filterAppointmentTypeByPatientType = createTransformer(({ patientType }) => {
    let filteredAppointmentTypes =
      this.appointmentConfig.appointmentTypes.filter((type) => {
        return (
          type.available_for === patientType ||
          type.available_for === "new_returning"
        );
      });
    this.setAppointmentConfig({ filteredAppointmentTypes });
  });

  fetchVacation = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/public/vacation`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the schedule"
        );
      } else {
        let filteredVacation = response.data.filter((vacation) => {
          vacation.from = moment
            .utc(vacation.from)
            .tz(this.officeInformation.timezone);
          vacation.to = moment
            .utc(vacation.to)
            .tz(this.officeInformation.timezone);
          const currentDateTime = moment().tz(this.officeInformation.timezone);
          return moment(vacation.to).isSameOrAfter(currentDateTime, "day");
        });
        filteredVacation.forEach((vacation) => {
          this.vacations.push({
            id: vacation.id,
            from: moment
              .utc(vacation.from)
              .tz(this.officeInformation.timezone)
              .format(),
            to: moment
              .utc(vacation.to)
              .tz(this.officeInformation.timezone)
              .format(),
          });
        });
        const parseFormat = "YYYY-MM-DD";
        let currentDay = moment();
        let vacationDays = [];
        filteredVacation.forEach((vacation) => {
          let vacationDay = moment(vacation.from, parseFormat);
          while (
            moment(vacationDay, parseFormat).isSameOrBefore(
              moment(vacation.to, parseFormat)
            )
          ) {
            vacationDays.push(moment(vacationDay).format(parseFormat));
            vacationDay.add(1, "day");
          }
        });
        let sortedVacationDays = Array.from(new Set(vacationDays)).sort(
          (a, b) => {
            return moment(a, parseFormat).diff(moment(b, parseFormat), "days") >
              0
              ? 1
              : -1;
          }
        );
        let flag = 0;
        if (sortedVacationDays.length > 0) {
          /**
           * If the first day of vacation is after the current day, select the current day as there is no need to check further
           */
          if (
            moment(sortedVacationDays[0], parseFormat).isAfter(
              moment(currentDay, parseFormat)
            )
          ) {
            this.setDateTime({
              date: new Date(currentDay),
            });
            flag = 1;
          } else {
            /**
             * If first day of vacation is same or before the current day, traverse through the vacation days to find a non vacation day
             * and set the current day accordingly
             */
            for (const day of sortedVacationDays) {
              if (
                moment(day, parseFormat).isSameOrAfter(
                  moment(currentDay, parseFormat)
                )
              ) {
                if (
                  moment(currentDay, parseFormat).diff(
                    moment(day, parseFormat),
                    "days"
                  ) === 0
                ) {
                  currentDay.add(1, "day");
                } else {
                  flag = 1;
                  this.setDateTime({
                    date: new Date(currentDay.add(1, "day")),
                  });
                  break;
                }
              }
            }
          }
        }
        if (flag === 0) {
          if (sortedVacationDays.length > 0) {
            currentDay = moment(
              sortedVacationDays[sortedVacationDays.length - 1],
              parseFormat
            );
            this.setDateTime({
              date: new Date(currentDay.add(1, "day")),
            });
          } else {
            this.setDateTime({
              date: new Date(currentDay),
            });
          }
        }
      }
      console.debug(this.vacations);
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the schedule"
      );
    }
  });

  async fetchAvailableSlots() {
    try {
      // this.setDisable(true)
      const queryString = serializeToQueryString({
        scheduledDate: moment(this.dateTime.date).format("YYYY-MM-DD"),
        appointmentTypeId: this.appointmentConfig.selectedAppointment.id,
        operatoryShouldExist: true,
        findFirstAvailable: true,
      });
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/schedules${queryString}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the available date and time"
        );
      } else {
        // this.setDisable(false);
        this.slots.replace(response.data.slots);
        this.slotsCopy.replace(response.data.slots);
        this.setAppointmentConfig({
          procedureTime: response.data.procedureTime,
        });

        if (this.slots.length !== 0) {
          const slotDate = new Date(
            moment
              .utc(this.slots[0].slot)
              .tz(this.officeInformation.timezone)
              .format("L")
          );

          if (
            moment(this.dateTime.date).format("L") !==
            moment(slotDate).format("L")
          ) {
            this.setDateTime({ date: slotDate, time: "" });
          }
        }
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the available date and time"
      );
    }
  }

  filterDaysByPractitioner(id) {
    if (id !== "any") {
      Object.entries(this.practitionerBusyDaysCopy).forEach(([key, value]) => {
        if (key !== "any") {
          if (parseInt(key) === parseInt(id)) {
            this.practitionerBusyDays = {};
            this.practitionerBusyDays["any"] = value;
          }
        }
      });
    } else {
      this.practitionerBusyDays["any"] = this.practitionerBusyDaysCopy["any"];
    }
  }

  filterPractitionersByDate = createTransformer(({ date, index, time }) => {
    // this.setPractitionerData({ selectedPractitioner: {} });
    if (
      typeof index !== "undefined" &&
      typeof time !== "undefined" &&
      time !== ""
    ) {
      this.setPractitionerData({
        practitionerIds: [...this.slots[index].provider],
      });
    } else if (time === "") {
      this.setPractitionerData({ practitionerIds: [...this.data] });
    } else {
      let ids = this.data.filter((id) => {
        const practitioner = this.datum[id];
        let data = this.slots.filter((slot) => {
          let filteredIds = slot.provider.filter((newId) => {
            return newId === practitioner.id;
          });
          if (filteredIds.length > 0) {
            return filteredIds[0];
          }
          return null;
        });
        if (data.length > 0) {
          return data[0];
        }
        return null;
      });
      this.setPractitionerData({ practitionerIds: [...ids] });
    }
  });

  filterAppointmentTimeByPractitioner(id) {
    let newSlots = this.slotsCopy.filter((slot) => {
      if (id === "any") {
        return slot;
      } else {
        if (slot.provider.includes(id)) {
          return slot;
        }
      }
      return null;
    });
    this.slots.replace(newSlots);
  }

  sendAppointmentForm = flow(function* ({ patient, relative, message }) {
    /**
     * JSON.stringify() offsets time according to timezone. To avoid this, using momentjs
     */
    patient.dob = moment(patient.dob).format("YYYY-MM-DDTHH:mm:ss");
    patient.isReturning = this.patientType === "Returning";
    let body = {};
    this.setFormStatus({ isSubmitting: true });
    const proc_codes =
      this.appointmentConfig.selectedAppointment.value.split(",");

    let ids = [];
    if (this.anyProvider) {
      // Find provider available according to the selected time slot
      const { provider } = this.slotsCopy.find((slot) => {
        return (
          moment
            .utc(slot.slot)
            .tz(this.officeInformation.timezone)
            .format("LT") ===
          moment
            .utc(this.dateTime.time)
            .tz(this.officeInformation.timezone)
            .format("LT")
        );
      });

      if (!!provider && provider.length) {
        ids = [...provider];
      } else {
        throw Error(
          "No provider found for selected time slot, please select appropriate provider"
        );
      }
    } else {
      ids = [this.practitionerData.selectedPractitioner.id];
    }

    const appointment = {
      appointmentTypeId: this.appointmentConfig.selectedAppointment.id,
      message,
      minutesDuration: this.appointmentConfig.procedureTime,
      practitionerIds: ids,
      proc_codes,
      start: moment
        .utc(this.dateTime.time)
        .tz(this.officeInformation.timezone)
        .format("YYYY-MM-DDTHH:mm:ss"),
      end: moment
        .utc(this.dateTime.time)
        .tz(this.officeInformation.timezone)
        .add(this.appointmentConfig.procedureTime, "minutes")
        .format("YYYY-MM-DDTHH:mm:ss"),
      status: "booked",
    };
    if (relative === null) {
      body = { patient, appointment };
    } else {
      body = { patient, relative, appointment };
    }

    const response = yield this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/public/appointments/schedule`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      null,
      AUTHORIZATION_TYPE.TENANT
    ).then((res) => res.json());
    if (!response.success) {
      throw Error(response.error.DetailedMessage);
    }
  });
}
