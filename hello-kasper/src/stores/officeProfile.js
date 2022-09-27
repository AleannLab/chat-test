import { flow, observable, action } from "mobx";

import { serializeToQueryString } from "../helpers/misc";
import CONSTANTS, { AUTHORIZATION_TYPE } from "../helpers/constants";
import Resource from "./utils/resource";

export class OfficeProfile extends Resource {
  loaded = false;
  isLoading = {
    office_brand_color: false,
  };

  data = {
    office_name: "",
    office_address: "",
    office_profile_pic: null,
    office_cover_pic: null,
    office_timezone: "",
    office_reply_to_email: "",
    office_brand_color: "#F4266E",
  };

  setOfficeData(data) {
    this.data = { ...this.data, ...data };
  }

  fetchData = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: [
            "office_name",
            "office_address",
            "office_profile_pic",
            "office_cover_pic",
            "office_timezone",
            "office_phone_number",
            "office_reply_to_email",
            "office_brand_color",
          ].join(","),
        }).toString()}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the office information"
        );
      } else {
        this.setOfficeData(response.data);
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the office information"
      );
    }
  });

  async fetchPatientBoardSettings() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: [
            "lobby_move_to_ready_on_no_pending_forms",
            "lobby_move_to_checkout_on_complete_in_od",
          ].join(","),
        }).toString()}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the patient board settings"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }

  async updatePatientBoardSettings({
    lobby_move_to_ready_on_no_pending_forms,
    lobby_move_to_checkout_on_complete_in_od,
  }) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config`,
        {
          method: "PUT",
          body: JSON.stringify({
            lobby_move_to_ready_on_no_pending_forms,
            lobby_move_to_checkout_on_complete_in_od,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to update the patient board settings"
        );
      }
    } catch (err) {
      throw err.message;
    }
  }

  updateOfficeProfile = flow(function* ({
    office_name,
    office_address,
    office_profile_pic,
    office_cover_pic,
    office_timezone,
    office_phone_number,
    office_reply_to_email,
  }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config`,
        {
          method: "PUT",
          body: JSON.stringify({
            office_name,
            office_address,
            office_profile_pic,
            office_cover_pic,
            office_timezone,
            office_phone_number,
            office_reply_to_email,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update the office information"
        );
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update the office information"
      );
    }
  });

  officeImageUpload = flow(function* (file) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = "profile_picture";
      const patient_id = 0;
      const did = "";
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        did,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload/public${queryString}`
      ).then((res) => res.json());
      if (response.uuid) {
        yield this.updateOfficeProfile({ office_profile_pic: response.uuid });
      }
      return response;
    } catch (err) {
      console.error(err);
      throw Error(err);
    }
  });

  deleteOfficeImage = flow(function* () {
    try {
      yield this.updateOfficeProfile({ office_profile_pic: "" });
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to delete the company logo"
      );
    }
  });

  uploadCompanyCover = flow(function* (file) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = "office_cover_pic";
      const patient_id = 0;
      const did = "";
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        did,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload/public${queryString}`
      ).then((res) => res.json());
      if (response.uuid) {
        yield this.updateOfficeProfile({ office_cover_pic: response.uuid });
      }
      return response;
    } catch (err) {
      console.error(err);
      throw Error(err);
    }
  });

  deleteCompanyCover = flow(function* () {
    try {
      yield this.updateOfficeProfile({ office_cover_pic: "" });
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to delete the company cover"
      );
    }
  });

  updateBrandColor = flow(function* (color) {
    try {
      this.isLoading = {
        office_brand_color: true,
      };

      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config`,
        {
          method: "PUT",
          body: JSON.stringify({ office_brand_color: color }),
        }
      ).then((res) => res.json());

      this.isLoading = {
        office_brand_color: false,
      };
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to update brand color"
        );
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to update brand color"
      );
    }
  });

  fetchPublicData = async () => {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/office-config?${new URLSearchParams(
          {
            configs: [
              "office_name",
              "office_address",
              "office_profile_pic",
              "office_cover_pic",
              "office_timezone",
              "office_phone_number",
              "office_reply_to_email",
              "office_brand_color",
            ].join(","),
            include_media_url: true,
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
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the office information"
      );
    }
  };
}
