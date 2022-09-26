import { observable, action, flow } from 'mobx';

import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';
import Resource from './utils/resource';

export class PatientData extends Resource {
  @observable selectAll = false;
  @observable isIncompleteSelected = false;
  @observable allFormsData = [];
  @observable selectedPatient = {
    id: null,
    firstName: null,
    lastName: null,
  };
  @observable emptyFormData = false;
  @observable isPrintingCompleteForm = false;
  @observable isPrintingSection = false;

  @action
  setIsPrintingSection(value) {
    this.isPrintingSection = value;
  }

  @action
  setIsPrintingCompleteForm(value) {
    this.isPrintingCompleteForm = value;
  }

  @action
  setSelectedPatient(id, firstName, lastName) {
    this.selectedPatient = {
      id,
      firstName,
      lastName,
    };
  }

  @action
  setEmptyFormData(value) {
    this.emptyFormData = value;
  }

  @action
  selectForm(formKey) {
    this.allFormsData.forEach((data) => {
      if (data.formKey === formKey) {
        data.isSelected = !data.isSelected;
      }
    });
  }

  formSelectCount() {
    let count = 0;
    this.allFormsData.forEach((data) => {
      if (data.isSelected) {
        count += 1;
      }
    });
    return count;
  }

  @action.bound
  async fetchFormData(formKey) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formKey}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while attempting to fetch the data!',
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  fetchPatientData = flow(async function* (formKey) {
    try {
      const formInfo = await this.fetchFormData(formKey);

      const formFilledInfo = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/submissions/${this.selectedPatient.id}/${formKey}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());
      if (!formFilledInfo.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch form information',
        );
      }
      const form = {
        formKey: formKey,
        name: formInfo.data.name,
        data: formFilledInfo.data,
        isSelected: false,
      };
      return form;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  fetchPatientForms = flow(function* () {
    this.setEmptyFormData(false);
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations/completed-forms/${this.selectedPatient.id}`,
      ).then((r) => r.json());
      if (response.success === false) throw Error(response.error.Message);

      let forms = [];
      yield Promise.all(
        response.data.map(async (formKey) => {
          if (formKey !== 'formConsentDisclosure' && formKey !== null) {
            try {
              const form = await this.fetchPatientData(formKey);
              forms.push(form);
            } catch (e) {
              console.error(e);
              throw Error(e.message);
            }
          }
        }),
      );
      if (forms.length === 0) {
        this.setEmptyFormData(true);
      }
      forms.forEach((form) => {
        this.allFormsData.push(form);
      });
    } catch (e) {
      console.error(e);
      throw Error(
        'An unexpected error occurred while attempting to fetch form data',
      );
    }
  });

  async sendToOpenDental(patientId, payload) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/send-to-pms/${patientId}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      ).then((r) => r.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while sending data to open dental',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e.message);
    }
  }

  @action
  toggleSelectAll(value) {
    this.selectAll = value;
  }

  @action
  toggleIsIncompleteSelected(value) {
    this.isIncompleteSelected = value;
  }
}
