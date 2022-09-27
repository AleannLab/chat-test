import { flow, observable, action } from "mobx";

import { serializeToQueryString } from "helpers/misc";
import CONSTANTS from "helpers/constants";
import Resource from "./utils/resource";

export class PatientFile extends Resource {
  patientFileUploaded = false;
  emptyPatientFiles = false;

  async listApiHandler(params) {
    let response = await this.fetch(
      `${CONSTANTS.MEDIA_API_URL}/files${serializeToQueryString(params)}`
    )
      .then((r) => r.json())
      .then((r) =>
        r.map((res) => ({
          ...res,
          id: res.uuid,
        }))
      );
    return response;
  }

  @action
  setEmptyPatientFiles(value) {
    this.emptyPatientFiles = value;
  }

  @action
  setPatientFileUploaded(value) {
    this.patientFileUploaded = value;
  }

  uploadPatientFile = flow(function* (patientId, fileName, file, categoryName) {
    try {
      const filename = fileName;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = categoryName;
      const patient_id = patientId;
      const description = fileName;
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        description,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`
      ).then((res) => res.json());
      // MEDIA_API_URL on successful upload will return the file {url, uuid, fileName}
      // if the upload fails, it will return the error {apiError: {Code, Message, HttpStatusCode}, detailedMessage}
      // assume the upload failed if the response is not contains the uuid property
      if (!response.uuid) {
        throw Error(
          "An unexpected error occurred while attempting to upload the file"
        );
      }
      return response;
    } catch (err) {
      console.error(err);
      throw Error(err);
    }
  });
}
