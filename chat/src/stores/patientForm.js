import { observable, flow, action, computed } from 'mobx';
import { serializeToQueryString } from 'helpers/misc';
import axios from 'axios';
import Resource from './utils/resource';
import AsyncStore from './utils/AsyncStore';
import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';

export class PatientForm extends Resource {
  @observable forms = [];
  @observable submissionSuccessful = false;
  @observable submissionUnsuccessful = false;
  @observable singleFormData = null;
  @observable openDisclosure = false;
  @observable activeStep = 0;
  @observable completed = {};
  @observable isFormAlreadySubmitted = false;
  @observable isPatientRefilling = false;
  @observable firstName = '';
  @observable providerDisplayImage = '';
  @observable providerSuffix = '';
  @observable isAgreed = false;
  @observable officeInformation = {
    telnyxNumber: null,
    email: null,
    brandColor: '#243656',
  };
  @observable Patientforms = [];

  @action
  setActiveStep(step) {
    if (this.isAgreed) {
      this.completed[0] = true;
    }
    this.activeStep = step;
  }

  @action
  setCompleted(step, value = true) {
    this.completed[step] = value;
  }

  @action
  resetCompleted() {
    this.completed = {};
  }

  @action
  setOpenDisclosure(value) {
    this.openDisclosure = value;
  }

  @action
  setIsFormAlreadySubmitted(value) {
    this.isFormAlreadySubmitted = value;
  }

  @action
  setIsPatientRefilling(value) {
    this.isPatientRefilling = value;
  }

  @action
  setIsAgreed(value) {
    this.isAgreed = value;
  }

  @action
  setOfficeInformation({ phoneNumber, officeName, officeImage, brandColor }) {
    this.officeInformation = {
      phoneNumber,
      officeName,
      officeImage,
      brandColor,
    };
  }

  @computed
  get formGroup() {
    return this.invitation.loaded
      ? this.invitation.data.map((r) => ({
          id: r.name,
          name: r.name,
          description: ``,
          formId: r.name,
        }))
      : [];
  }

  fetchAllFormsData = flow(function* (inviteId) {
    const response = yield this.fetch(
      `${CONSTANTS.FORMS_API_URL}/submissions/${inviteId}`,
      {
        method: 'GET',
      },
      null,
      AUTHORIZATION_TYPE.TENANT,
    );
    const jsonResponse = yield response.json();
    if (jsonResponse.data) {
      this.singleFormData = jsonResponse;
    }
  });

  fetchOfficeInformation = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/office-config?${new URLSearchParams(
          {
            configs: [
              'office_name',
              'office_address',
              'office_profile_pic',
              'office_timezone',
              'office_phone_number',
              'office_cover_pic',
              'office_brand_color',
            ].join(','),
            include_media_url: true,
          },
        ).toString()}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the office details',
        );
      } else {
        this.setOfficeInformation({
          phoneNumber: response?.data?.office_phone_number,
          officeName: response?.data?.office_name,
          officeImage: response?.data?.office_profile_pic_url.url,
          brandColor: response?.data?.office_brand_color || '#243656',
        });
        return response.data;
      }
    } catch (err) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the office details',
      );
    }
  });

  invitation = new AsyncStore();
  fetchPatientForm = flow(function* (inviteId) {
    this.invitation.loading = true;
    try {
      // let queryString = serializeToQueryString(params);
      var response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations/${inviteId}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((r) => r.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch the forms',
        );
      } else {
        this.firstName = response.data[0].firstname;
        this.provider = response.data[0].provider;
        this.providerSuffix = response.data[0].providerSuffix;
        this.providerDisplayImage = response.data[0].providerDisplayImage;
        this.providerAbbr = response.data[0].providerAbbr;
        this.invitation.data = [];
        if (response.data[0].allFormsSubmitted) {
          this.setIsFormAlreadySubmitted(true);
        } else {
          this.invitation.data = response.data;
          this.invitation.data.unshift({
            estimatedTime: 60,
            formKey: 'formConsentDisclosure',
            name: 'Consent Form',
            patientId: this.invitation.data[0].patientId,
          });
          if (!this.isPatientRefilling) {
            if (response.data[0].status === 'completed') {
              this.setIsFormAlreadySubmitted(true);
            }
          }
        }
        this.invitation.loading = false;
        this.invitation.loaded = true;
        this.fetchAllFormsData(inviteId);
      }
    } catch (e) {
      this.invitation.error = e;
      this.invitation.loading = false;
      this.notification.showError(this.errorFormatter('list', e));
    }
  });

  constructor(store) {
    super(store);
    this.store = store;
    // autorun(() => this.getFormGroup());
  }

  submitForm = flow(function* (formKey, inviteId, formData) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    try {
      if (formData.FORM_SAVEpatientPicture) {
        formData.FORM_SAVEpatientPicture = yield this.uploadFileArray(
          formData.FORM_SAVEpatientPicture,
          inviteId,
        );
      }

      if (formData.FORM_SAVEdriversLicense) {
        formData.FORM_SAVEdriversLicense = yield this.uploadFileArray(
          formData.FORM_SAVEdriversLicense,
          inviteId,
        );
      }

      if (formData.FORM_SAVEinsuranceCard) {
        formData.FORM_SAVEinsuranceCard = yield this.uploadFileArray(
          formData.FORM_SAVEinsuranceCard,
          inviteId,
        );
      }

      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/submissions`,
        {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify({
            formkey: formKey,
            invitationId: inviteId,
            formData: formData,
          }),
        },
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());
      if (!response.success) {
        this.submissionUnsuccessful = true;
        throw Error(
          'An unexpected error occurred while attempting to submit the form',
        );
      } else {
        this.submissionSuccessful = true;
        try {
          yield this.fetchAllFormsData(inviteId);
        } catch (e) {
          console.error(e);
          throw Error(
            'An unexpected error occurred while attempting to fetch the form',
          );
        }
      }
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to submit the form',
      );
    }
  });

  submissionComplete = flow(function* (inviteId) {
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations/status/${inviteId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            status: 'completed',
          }),
        },
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to submit the form',
        );
      }
    } catch (e) {
      throw Error(
        'An unexpected error occurred while attempting to submit the form',
      );
    }
  });

  async getOfficeDetails() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/office-config?${new URLSearchParams(
          {
            configs: 'office_name,office_profile_pic',
            include_media_url: true,
          },
        ).toString()}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the office details!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  async getFamilyInvitationData(phoneUID) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/public/invitations/family-invite/${phoneUID}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the data!',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  async fetchPatientForms(patientId) {
    const response = await this.fetch(
      `${CONSTANTS.FORMS_API_URL}/invitations/forms-status/${patientId}`,
    ).then((r) => r.json());

    if (!response.success) {
      throw Error(
        'An unexpected error occurred while attempting to fetch the form status',
      );
    } else {
      return response.data;
    }
  }

  async updatePatientInvitation(invitationId, forms) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations/${invitationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ forms }),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error('An unexpected error occurred while updating operatories');
      } else {
        return response;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  async patientInvitation(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations`,
        {
          method: 'POST',
          body: JSON.stringify({
            patient_id: id,
            forms: [],
            sendSms: false,
            sendEmail: false,
          }),
        },
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while Inviting Patient',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  getUploadUrl = flow(function* (fileName, file, patientSecret) {
    try {
      const filename = fileName;
      const filesize = file.size;
      const content_type = file.type;
      const category_name = 'Fax';
      const patient_id = 0;
      const to_did = null;
      const tenantId =
        CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0];
      const queryString = serializeToQueryString({
        filename,
        filesize,
        content_type,
        category_name,
        patient_id,
        to_did,
      });

      const response = yield fetch(
        `${CONSTANTS.MEDIA_API_URL}/public/files/upload${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${patientSecret}`,
            AuthorizationType: 'patient',
            'x-custom-tenant-id': tenantId,
          },
        },
      ).then((res) => res.json());
      return response;
    } catch (err) {
      console.error(err);
      throw Error(
        'An unexpected error occurred while attempting to upload the file',
      );
    }
  });

  uploadFile = flow(function* (signedUrl, file) {
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
        'An unexpected error occurred while attempting to upload the file',
      );
    }
  });

  uploadFileArray = flow(function* (uploadItemArray, patientSecret) {
    const mediaInfoArray = new Array();

    for (const uploadItem of uploadItemArray) {
      const file = yield this.dataUrltoFile(
        uploadItem.url,
        uploadItem.originalName,
      );

      const signedUpload = yield this.getUploadUrl(
        file.name,
        file,
        patientSecret,
      );

      yield this.uploadFile(signedUpload.url, file);
      mediaInfoArray.push(signedUpload.uuid);
    }

    return mediaInfoArray;
  });

  dataUrltoFile = flow(function* (dataUrl, filename) {
    var arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      buffer = Buffer.from(arr[1], 'base64');

    return new File([buffer], filename, { type: mime });
  });
}
