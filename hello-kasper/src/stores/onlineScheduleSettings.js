import { action, observable } from "mobx";

import { serializeToQueryString } from "helpers/misc";
import CONSTANTS from "helpers/constants";
import Resource from "./utils/resource";

export class OnlineScheduleSettings extends Resource {
  showEditInsurance = false;
  providerSearchVal = "";

  @action
  setProviderSearchVal(value) {
    this.providerSearchVal = value;
  }

  @action
  setShowEditInsurance(value) {
    this.showEditInsurance = value;
  }

  async fetchAppointmentNotificationEmail() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: [
            "appointmentNotificationEmail",
            "appointmentNotificationEnabled",
          ].join(","),
        }).toString()}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the notification email"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the notification email"
      );
    }
  }

  async updateAppointmentNotificationEmailSettings({
    appointmentNotificationEmail,
    appointmentNotificationEnabled,
  }) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config`,
        {
          method: "PUT",
          body: JSON.stringify({
            appointmentNotificationEmail,
            appointmentNotificationEnabled,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the notification email"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the notification email"
      );
    }
  }

  async fetchAppointmentGroups() {
    try {
      const params = {
        mapped: false,
      };
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type${serializeToQueryString(
          params
        )}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the appointment groups"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the appointment groups"
      );
    }
  }

  async fetchConfiguration() {
    try {
      const params = {
        mapped: true,
      };
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type${serializeToQueryString(
          params
        )}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch procedure information"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch procedure information"
      );
    }
  }

  async updateAvailableFor(procedureInfo) {
    const { appointmentTypeId, isNewPatient, isReturningPatient } =
      procedureInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type/${appointmentTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            isNewPatient,
            isReturningPatient,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update procedure status"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update procedure status"
      );
    }
  }

  async updateDisplayName(procedureInfo) {
    const { display_name, appointmentTypeId } = procedureInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type/${appointmentTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            displayName: display_name,
            mapped: 1,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the display name"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the display name"
      );
    }
  }

  async deleteProcedure(procedureInfo) {
    const { appointmentTypeId } = procedureInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type/${appointmentTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            mapped: 0,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to delete the procedure"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to delete the procedure"
      );
    }
  }

  async fetchOperatories() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/operatory`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the operatories"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the operatories"
      );
    }
  }

  async updateOperatoryMapping(data) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the operatory"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the operatory"
      );
    }
  }

  async fetchProviders() {
    try {
      let url = `${
        CONSTANTS.OFFICE_API_URL
      }/practitioners${serializeToQueryString({
        sortCol: "f_name",
      })}`;
      if (this.providerSearchVal !== "") {
        url = `${
          CONSTANTS.OFFICE_API_URL
        }/practitioners${serializeToQueryString({
          sortCol: "f_name",
          search: this.providerSearchVal,
        })}`;
      }
      const response = await this.fetch(url).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the providers"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the providers"
      );
    }
  }

  async updateProviders(providerInfo) {
    const { appointmentTypeId, providers } = providerInfo;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-type-provider-mapping/${appointmentTypeId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            providers,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the providers"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the providers"
      );
    }
  }

  async fetchInsuranceInformation() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/insurance`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch insurance information"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch insurance information"
      );
    }
  }

  async updateInsuranceInformation(insurance) {
    const { id, isActive, inNetwork } = insurance;
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/insurance/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            isActive,
            inNetwork,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the insurance information"
      );
    }
  }
}
