import Resource from './utils/resource';
import CONSTANTS, {
  APPOINTMENT_STATUS_CONFIG,
  AUTHORIZATION_TYPE,
} from 'helpers/constants';
import moment from 'moment';
import { convertCustomTime, convertCurrentTime } from 'helpers/timezone';
import { generateColor, shadeColor } from 'helpers/misc';
import { observable } from 'mobx';
import { queryClient } from 'App';

const DATE_FORMAT_PATTERN = 'YYYY-MM-DD HH:mm:ss';

export class Scheduling extends Resource {
  visibleOperatories = [];
  @observable selectedPatientId = null;

  setSelectedPatientId(patientId) {
    this.selectedPatientId = patientId;
  }

  @observable currentDate = convertCurrentTime({ format: 'L' });

  setCurrentDate(newDate) {
    this.currentDate = moment(newDate).format('L');
  }

  /**
   * Get all operatories
   */
  async getOperatories() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/operatory`,
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch operatories',
        );
      } else {
        const mappedData = response.data
          .map(({ id, abbrev: text, is_hidden, item_order: order }) => ({
            id,
            text,
            isHidden: !!is_hidden,
            order,
          }))
          .sort((a) => a.order);
        this.visibleOperatories = mappedData
          .map(({ id, isHidden }) => !isHidden && id)
          .filter((d) => d);
        return mappedData;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Update operatories
   * @param {Object} reqObj
   */
  async updateOperatory(reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/operatory`,
        {
          method: 'PUT',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error('An unexpected error occurred while updating operatories');
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get appointments
   * @param {Date} currentDate
   */
  async getAppointments(currentDate, search = {}) {
    try {
      const params = {
        ...search,
        startDate: moment(currentDate)
          .startOf('day')
          .format(DATE_FORMAT_PATTERN),
        endDate: moment(currentDate).endOf('day').format(DATE_FORMAT_PATTERN),
        operatories: this.visibleOperatories,
        withProcedures: true,
      };

      // Input params to API - start date, end date, list of operatory ids;
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointments?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch appointments',
        );
      } else {
        const mappedData = response.data
          .filter(({ od_status_id }) =>
            APPOINTMENT_STATUS_CONFIG.filter(
              ({ showOnScheduler }) => showOnScheduler,
            )
              .map(({ odId }) => odId)
              .includes(od_status_id),
          )
          .map(
            ({
              id,
              patient_id: patientId,
              patient_fname: patientFirstName,
              patient_lname: patientLastName,
              patient_dob: patientDOB,
              patient: patientFullName,
              patient_phone_no: patientPhoneNo,
              patient_email: patientEmail,
              od_operatory_id: odOperatory,
              operatory_id: operatory,
              od_status_id,
              start,
              minutes_duration,
              practitioner_id: practitionerId,
              practictioner_abbr,
              hygiene_abbr,
              description,
              procedures,
              fees: total,
            }) => {
              const startDate = convertCustomTime({
                dateTime: start,
                format: DATE_FORMAT_PATTERN,
              });
              const endDate = convertCustomTime({
                dateTime: moment(start).add(minutes_duration, 'minutes'),
                format: DATE_FORMAT_PATTERN,
              });
              return {
                id,
                patient: {
                  id: patientId,
                  name: patientFullName,
                  firstName: patientFirstName,
                  lastName: patientLastName,
                  dob: patientDOB,
                  displayName: patientFullName,
                  phone_no: patientPhoneNo,
                  email: patientEmail,
                },
                title: patientFullName,
                odOperatory,
                operatory,
                status: od_status_id,
                startDate,
                endDate,
                practitionerId,
                provider: [practictioner_abbr, hygiene_abbr]
                  .filter((e) => e)
                  .join(', '),
                description,
                procedures: procedures.map(
                  ({
                    od_procedurecode_id: id,
                    abbrivation: name,
                    procedure_code: code,
                    description,
                  }) => ({ id, name, code, description }),
                ),
                total,
                units: null,
                insurance: null,
                code: null,
                site: null,
                copay: null,
              };
            },
          );

        return mappedData;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get status definitions for appointments
   */
  async getStatusDefinitions() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointment-status`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch status definitions',
        );
      } else {
        const mappedData = response.data
          .map(({ od_id: id, display_name: name, value }) => {
            const { primaryColor, secondaryColor } =
              APPOINTMENT_STATUS_CONFIG.find(
                (status) => status.odId === id,
              ) || {
                primaryColor: '#727272',
                secondaryColor: '#EAEAEA',
              };
            return {
              id,
              name,
              value,
              config: {
                primaryColor,
                secondaryColor,
              },
            };
          })
          .sort((a, b) => a.id - b.id);
        return mappedData;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get confirmed status definitions for appointments
   */
  async getConfirmedStatusDefinitions() {
    try {
      const params = {
        category: 'ApptConfirmed',
      };

      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/definitions?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch confirmed status definitions',
        );
      } else {
        const mappedData = response.data.map(({ od_def_id: id, name }) => {
          const primaryColor = generateColor(id, 0);
          return {
            id,
            name,
            config: {
              primaryColor,
              secondaryColor: shadeColor(primaryColor, 500),
            },
          };
        });
        return mappedData;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get patient information by patient id
   * @param {Number} patientId
   */
  async getPatientInformationById(patientId) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/patients/${patientId}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch patient information',
        );
      } else {
        const {
          id,
          firstname: firstName,
          lastname: lastName,
          phone_no: phoneNo,
          email,
          gender,
          preffered_provider: prefferedProvider,
          dob,
          od_id: odId,
          status,
          next_appointment_on: nextAppointmentDate,
          created_at: createdDate,
        } = response.data;

        return {
          id,
          firstName,
          lastName,
          phoneNo,
          email,
          gender,
          prefferedProvider,
          dob,
          odId,
          status,
          nextAppointmentDate,
          createdDate,
        };
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get patient tasks by patient id
   * @param {Number} patientId
   */
  async getTasksByPatientId(patientId) {
    try {
      const params = {
        patient: patientId,
      };

      const response = await this.fetch(
        `${CONSTANTS.TASK_API_URL}/tasks?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch patient tasks',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get patient appointments by patient id
   * @param {Number} patientId
   */
  async getAppointmentsByPatientId(patientId) {
    try {
      const params = {
        patientId: patientId,
        futureOnly: true,
      };

      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointments?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch patient tasks',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get patient appointments by patient id
   * @param id
   */
  async getAppointmentPublic(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/public/appointments/${id}/`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT,
      ).then((res) => res.json());
      if (response?.error?.HttpStatusCode === 410) {
        return {
          expired: true,
        };
      }
      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch appointment details',
        );
      }

      const { appointment, patient } = response.data;
      const startDate = convertCustomTime({
        dateTime: appointment.start,
        format: 'dddd, MMMM D, YYYY',
      });
      const startTime = convertCustomTime({
        dateTime: appointment.start,
        format: 'h:mm A',
      });
      const endTime = convertCustomTime({
        dateTime: moment(appointment.start).add(
          appointment.minutes_duration,
          'minutes',
        ),
        format: 'h:mm A',
      });

      const dobFormatted =
        patient.dob &&
        convertCustomTime({
          dateTime: moment(patient.dob).add(patient.dob, 'minutes'),
          format: 'LL',
        });
      const yearsOld = moment().diff(
        convertCustomTime({
          dateTime: patient.dob,
        }),
        'years',
      );
      return {
        ...response.data,
        appointment: {
          ...appointment,
          startDate,
          startTime,
          endTime,
        },
        patient: {
          ...patient,
          dobFormatted,
          yearsOld,
        },
      };
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get all practitioners
   */
  async getPractitioners() {
    try {
      const params = {
        sortCol: 'abbr',
      };

      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/practitioners?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch practitioners',
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Get all procedures
   */
  async getProcedures() {
    try {
      const params = {
        showTime: true,
      };

      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/procedure-code?${new URLSearchParams(
          params,
        ).toString()}`,
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          'An unexpected error occurred while attempting to fetch procedures',
        );
      } else {
        const mappedData = response.data
          .map(
            ({
              od_code_id: id,
              procedure_code: value,
              abbrivation: name,
              time,
              description,
            }) => ({
              id,
              value,
              name,
              time,
              description,
            }),
          )
          .sort((a, b) => a.name.localeCompare(b.name));
        return mappedData;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  /**
   * Schedule an appointment
   * @param {Object} reqObj
   */
  async scheduleAppointment(reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointments/office-schedule`,
        {
          method: 'POST',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while scheduling an appointment',
        );
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update an appointment
   * @param {Object} reqObj
   */
  async updateAppointment(reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/appointments/office-schedule/${reqObj.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(reqObj),
        },
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            'An unexpected error occurred while updating an appointment',
        );
      }
    } catch (e) {
      throw e.message;
    }
  }

  async refreshIfCurrentDateSelected(apptDate) {
    const inputDate = convertCustomTime({ dateTime: apptDate, format: 'L' });
    if (inputDate === this.currentDate) {
      queryClient.refetchQueries(['officeAppointments', this.currentDate]);
    }
  }
}
