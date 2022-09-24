import { SingleSelectableResource } from './utils/SingleSelectableResource';
import { flow } from 'mobx';
import { NOT_LOADED } from 'helpers/loadstates';
import { createTransformer } from 'mobx-utils';
import { serializeToQueryString } from 'helpers/misc';
import PhoneNumber from 'awesome-phonenumber';
import { generateColor } from 'helpers/misc';
import CONSTANTS from 'helpers/constants';
export class Patient extends SingleSelectableResource {
  listMapper = (newData, oldData, _index, _results) => {
    let payload = {
      ...(oldData ? oldData : {}),
      ...(newData ? newData : {}),
      __tasks_sync: NOT_LOADED,
      tasks: [],
      __appointments_sync: NOT_LOADED,
      appointments: [],
      __chats_sync: NOT_LOADED,
      chats: [],
      displayName:
        newData.firstname || newData.lastname
          ? `${newData.firstname} ${newData.lastname}`
          : newData.email,
      profilePicColor: generateColor(newData.id),
    };

    if (_index === 0 && !this.selected) {
      console.log(newData, oldData, _index, _results);
      payload.__isSelected = true;
      this.selected = newData.id;
    }

    return payload;
  };

  listApiAbortController = null; // listApiAbortController - is used to abort unnecessary subsequent calls to fetch patient list
  listApiHandler = async (params) => {
    if (this.listApiAbortController) this.listApiAbortController.abort();

    this.listApiAbortController = new AbortController();

    var queryString = serializeToQueryString({
      ...params,
      patientsOnly: true,
    });

    return this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients${queryString}`, {
      signal: this.listApiAbortController.signal,
    })
      .then((r) => r.json())
      .then((r) => {
        return r.data;
      })
      .catch((e) => {
        return [];
      });
  };

  getApiHandler = async (id) => {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    console.log([patientInfo]);
    return patientInfo;
  };

  getPatientByPhoneNumberAction = flow(function* ({ phoneNo }) {
    const patient = yield this._getPatientByPhoneNumberApiHandler({
      phoneNo,
    });
    if (patient) this.datum[patient.id] = patient;
  });

  async _getPatientByPhoneNumberApiHandler({ phoneNo }) {
    let result = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/patients/phoneNo/${phoneNo}`,
    ).then((response) => response.json());
    return result.data;
  }

  getPatientByPhoneNumber = createTransformer(({ phoneNo }) => {
    let patient = Object.values(this.datum).find(
      (p) => p.phone_no && p.phone_no.trim() === phoneNo.trim(),
    );
    if (patient) return `${patient.firstname} ${patient.lastname}`;

    var phone = PhoneNumber(phoneNo);
    return phone ? phone.getNumber('national') : phoneNo;
  });

  getPatientAsTags = createTransformer((_params) => {
    return Object.values(this.datum).map((patient) => {
      return {
        id: patient.id,
        name: `${patient.firstname ?? ''}${' '}${
          patient.lastname ?? ''
        }`.trim(),
      };
    });
  });
}
