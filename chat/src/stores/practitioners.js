import { flow } from 'mobx';

import { serializeToQueryString } from 'helpers/misc';
import CONSTANTS from 'helpers/constants';
import Resource from './utils/resource';

export class Practitioners extends Resource {
  async fetchPractitioners() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners${serializeToQueryString({
          sortCol: 'f_name',
        })}`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the practitioners',
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the practitioners',
      );
    }
  }

  setDefaultPractitioner = flow(function* ({ id, is_default }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            is_default,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error while attempting to update the default practitioner',
        );
      }
    } catch (err) {
      throw Error(
        'An unexpected error while attempting to update the default practitioner',
      );
    }
  });

  uploadAvatar = flow(function* ({ file }) {
    try {
      const filename = file.name;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = 'Test';
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`,
      ).then((res) => res.json());
      if (!response.uuid) {
        throw Error(
          'An unexpected error occurred while attempting to upload the image',
        );
      } else {
        return response;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to upload the image',
      );
    }
  });

  updateAvatar = flow(function* ({ id, display_image }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            display_image,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to update the image',
        );
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to update the image',
      );
    }
  });

  async editPractitioner({ id, phoneNo, bio, readyForDocSms }) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            phoneNo,
            bio,
            readyForDocSms,
          }),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to edit the information',
        );
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to edit the information',
      );
    }
  }
}
