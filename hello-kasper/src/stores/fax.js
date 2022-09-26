import { flow } from 'mobx';
import { serializeToQueryString } from 'helpers/misc';
import axios from 'axios';

import Resource from './utils/resource';
import CONSTANTS from 'helpers/constants';
import { store } from 'stores';
import { queryClient } from 'App';

export class Fax extends Resource {
  getFaxNumbers = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.VOIP_API_URL}/faxnumbers`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to get the Fax Numbers',
      );
    }
  });

  getUploadUrl = flow(function* (fileName, file) {
    try {
      const filename = fileName;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = 'Fax';
      const patient_id = 0;
      const to_did = null;
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        to_did,
      });
      const response = yield this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/upload${queryString}`,
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to upload the document',
      );
    }
  });

  uploadFaxDocument = flow(function* (signedUrl, file) {
    try {
      // Upload File
      const result = yield axios({
        method: 'PUT',
        url: signedUrl,
        headers: {
          'content-type': file.type,
        },
        processData: false,
        data: file,
      });

      return result;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to send the fax',
      );
    }
  });

  sendFax = flow(function* (
    from_did,
    to_did,
    provider,
    files,
    coverLetter,
    authToken,
    utils,
  ) {
    try {
      store.notification.showInfo('Uploading files...');

      let signedUrls = [];

      for (const file of files) {
        const signedUpload = yield this.getUploadUrl(file.name, file);

        if (signedUpload.url) {
          yield this.uploadFaxDocument(signedUpload.url, file);

          const downloadUrl = utils.prepareMediaUrl({
            uuid: signedUpload.uuid,
            authToken: authToken,
            redirect: false,
          });

          const signedDownload = yield fetch(downloadUrl);
          signedUrls = [
            ...signedUrls,
            {
              media_url: signedDownload.url,
              media_uuid: signedUpload.uuid,
              media_type: file.name
                .split('.')
                [file.name.split('.').length - 1].toLowerCase(),
            },
          ];
        }
      }

      store.notification.showInfo('Sending fax...');

      const payload = {
        from_did,
        to_did,
        provider,
        files: signedUrls,
        ...coverLetter,
      };

      const response = yield this.fetch(`${CONSTANTS.VOIP_API_URL}/faxes`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (response.status !== 200) {
        throw Error(
          'An unexpected error occurred while attempting to send the fax',
        );
      }
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to send the fax',
      );
    }
  });

  deleteFax = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.VOIP_API_URL}/faxes/${id}`,
        {
          method: 'DELETE',
        },
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        err?.DetailedMessage ||
          'An unexpected error occurred while attempting to delete the Fax',
      );
    }
  });

  updateFaxLog = flow(function* (faxUuid, data) {
    try {
      const selectedActivity = store.activityLogs.selectedActivity;

      if (faxUuid === selectedActivity?.uuid) {
        store.activityLogs.setSelectedActivity({
          ...selectedActivity,
          ...data,
        });
      }

      const faxQueryKey = store.activityLogs.queryKeys.faxLogs;
      const [queryKeys, prevData] =
        queryClient.getQueriesData([faxQueryKey])?.[0] ?? [];

      const newPagesArray =
        prevData?.pages.map((page) =>
          page.map((val) => {
            if (val.uuid === faxUuid) {
              return { ...val, ...data };
            } else return val;
          }),
        ) ?? [];

      queryClient.setQueryData(queryKeys, (prevData) => ({
        ...prevData,
        pages: newPagesArray,
      }));

      queryClient.invalidateQueries(queryKeys);
    } catch (error) {
      store.notification.showError(error.message);
    }
  });

  getCoverLetters = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.VOIP_API_URL}/faxes/cover-pages`,
        {
          method: 'GET',
        },
      ).then((res) => res.json());
      return response.data.filter(({ userId }) => Boolean(userId));
    } catch (err) {
      console.error(err);
      throw Error(
        err?.DetailedMessage ||
          'An unexpected error occurred while attempting to fetch the cover letters',
      );
    }
  });

  previewFax = async function (tokens) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.VOIP_API_URL}/faxes/preview`,
        {
          method: 'POST',
          body: JSON.stringify(tokens),
        },
      );
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (err) {
      console.error(err);
      throw Error(
        err?.DetailedMessage ||
          'An unexpected error occurred while attempting to fetch the cover letters',
      );
    }
  };
}
