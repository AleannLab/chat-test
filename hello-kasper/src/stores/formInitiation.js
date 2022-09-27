import CONSTANTS from "helpers/constants";
import { observable, flow } from "mobx";

import { serializeToQueryString } from "helpers/misc";
import { SingleSelectableResource } from "./utils/SingleSelectableResource";

export class FormInitiation extends SingleSelectableResource {
  isAuthorized = false;

  setIsAuthorized(value) {
    this.isAuthorized = value;
  }
  listApiAbortController = null; // listApiAbortController - is used to abort unnecessary subsequent calls to fetch patient list
  async listApiHandler(params) {
    if (this.listApiAbortController) this.listApiAbortController.abort();

    this.listApiAbortController = new AbortController();
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/patients/invites${serializeToQueryString(
          params
        )}`,
        {
          signal: this.listApiAbortController.signal,
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to send the entered pin"
        );
      }
      return response.data;
    } catch (err) {
      return [];
    }
  }

  verifyPin = flow(function* (pin) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/pin/verify`,
        {
          method: "POST",
          body: JSON.stringify({
            pin: pin,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to send the entered pin"
        );
      }
      return response;
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the resources"
      );
    }
  });
}
