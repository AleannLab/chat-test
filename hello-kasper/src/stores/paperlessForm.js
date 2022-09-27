import CONSTANTS, { AUTHORIZATION_TYPE } from "helpers/constants";
import { observable, action, flow } from "mobx";
import { createTransformer } from "mobx-utils";
import Resource from "./utils/resource";
import { v4 as uuidv4 } from "uuid";

export class PaperlessForm extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  isFetching = false;

  // Form sections
  selectedSections = [];
  formAdditionSuccessful = false;
  formAdditionUnsuccessful = false;
  selectedFormForPreview = {
    estimatedCompletionTime: 60,
    formKey: "formConsentDisclosure",
    name: "Consent Form",
    count: "-",
  };
  activeStep = 0;
  openDisclosure = false;
  groupedSections = new Map();
  temporarySections = [];
  emptyGroup = false;
  emptySection = false;
  sectionToGroupAdditionSuccessful = false;
  sectionToGroupAdditionUnsuccessful = false;
  isSectionArchived = false;
  isSectionUnarchived;
  isSectionRemovedFromGroup;
  sectionsToAddToGroups = [];
  filledOutCount = "-";
  isGroupSent = false;
  printingData = {};
  officeInformation = {
    telnyxNumber: null,
    email: null,
  };

  // Form groups
  showArchived = false;

  // Invitation data
  patientsInvitationList = [];

  searchItem = "";
  metaOnly = false;
  generatingPdf = false;
  generatedPdfUrl = "";

  async listApiHandler(params) {
    let response = await this.fetch(
      `${CONSTANTS.FORMS_API_URL}/forms?metaOnly=${this.metaOnly}${
        params !== undefined &&
        params !== "" &&
        Object.hasOwn(params, "search") === true &&
        params.search !== ""
          ? "&search=" + params.search
          : ""
      }`
    )
      .then((r) => r.json())
      .then((r) => r.data);

    return response.map((res) => ({
      id: res.formKey,
      ...res,
    }));
  }

  getAllSectionsByArchiveStatus = createTransformer(({ archived = false }) => {
    let allSections = Object.values(this.datum).filter(
      (section) => section.archived === archived
    );
    return allSections.sort((a, b) => a.order - b.order);
  });

  getAllSectionsByIds = createTransformer(
    ({ formKeys = [], archived = false }) => {
      return Object.values(this.datum).filter(
        (section) =>
          formKeys.includes(section.formKey) && section.archived === archived
      );
    }
  );

  @action.bound
  setIsFetching(state) {
    this.isFetching = state;
  }

  @action
  setPrintingData(value) {
    this.printingData = value;
  }

  @action
  setFilledOutCount(value) {
    this.filledOutCount = value;
  }

  @action
  resetSelectedSections() {
    this.selectedSections.clear();
  }

  @action
  setConsentForm() {
    this.selectedSections.unshift({
      index: -1,
      form: {
        estimatedCompletionTime: 60,
        formKey: "formConsentDisclosure",
        name: "Consent Form",
      },
    });
    this.setActiveStep(0);
  }

  @action
  resetSectionsToAddToGroups() {
    this.sectionsToAddToGroups.clear();
  }

  @action
  addSectionsToAddToGroups(formKey) {
    this.sectionsToAddToGroups.push(formKey);
  }

  @action
  setIsSectionArchived(value) {
    this.isSectionArchived = value;
  }

  @action
  setIsSectionUnarchived(value) {
    this.isSectionUnarchived = value;
  }

  @action
  setFormForPreview(form) {
    this.selectedFormForPreview = form;
  }

  @action
  setIsSectionRemovedFromGroup(value) {
    this.isSectionRemovedFromGroup = value;
  }

  @action.bound
  setActiveStep(step) {
    this.activeStep = step;
  }

  @action
  setOpenDisclosure(value) {
    this.openDisclosure = value;
  }

  @action
  setIsGroupSent(value) {
    this.isGroupSent = value;
  }

  @action
  selectSection({ form, index = 0 }) {
    const selectedFormsCopy = [...this.selectedSections];
    let removed = 0;
    selectedFormsCopy.forEach((section, newIndex) => {
      if (section.form.formKey === form.formKey) {
        this.setActiveStep(0);
        selectedFormsCopy.splice(newIndex, 1);
        removed = 1;
      }
    });
    if (removed === 0) {
      selectedFormsCopy.push({
        index: index,
        form: form,
      });
      this.formRemoved = false;
    }
    this.selectedSections = [...selectedFormsCopy];
  }

  @action.bound
  reorderSections({ sections, useIndices = false }) {
    const selectedFormsCopy = [...this.selectedSections];
    selectedFormsCopy.forEach((form) => {
      sections.forEach((section, index) => {
        if (!!form && form.form.formKey === section.formKey) {
          if (useIndices) {
            form.index = index;
          } else {
            form.index = section.index;
          }
        }
      });
    });
    this.selectedSections.replace(selectedFormsCopy);
  }

  @action
  setOfficeInformation({ phoneNumber }) {
    this.officeInformation = { phoneNumber };
  }

  @action
  setMetaOnly(value) {
    this.metaOnly = value;
  }

  fetchOfficeInformation = flow(function* () {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/office-config?${new URLSearchParams({
          configs: "office_phone_number",
        }).toString()}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the office details"
        );
      } else {
        this.setOfficeInformation({
          phoneNumber: response.data.office_phone_number,
        });
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the office details"
      );
    }
  });

  submitForm = flow(function* (sectionName, sectionKey, sectionJSON) {
    const randomID = Math.floor(Math.random() * 900 + 100);
    const id = sectionName
      .toLowerCase()
      .split(" ")
      .join("")
      .concat(`_${randomID}`);
    const response = yield this.fetch(`${CONSTANTS.FORMS_API_URL}/forms`, {
      method: "POST",
      body: JSON.stringify({
        id: sectionKey.length === 0 ? id : sectionKey,
        name: sectionName,
        form: JSON.parse(sectionJSON),
      }),
    }).then((res) => res.json());
    if (!response.success) {
      this.formAdditionUnsuccessful = true;
    } else {
      this.formAdditionSuccessful = true;
      yield this.fetchList();
    }
  });

  generateInviteLink = flow(function* (
    id,
    sendSms,
    sendEmail,
    incompleteForms
  ) {
    let selectedFormNames = [];
    const sortedSelectedSections = this.selectedSections.sort((a, b) => {
      if (!!a && !!b) {
        if (a.index < b.index) return -1;
        return a.index > b.index ? 1 : 0;
      }
      return null;
    });

    sortedSelectedSections.forEach((form) => {
      /**
       * Refer KAS-1776: Do not send formConsentDisclosure key as the consent form on Invitation UI
       * is shown on the first step and is independent whether this key is present or not
       */
      if (form.form.formKey !== "formConsentDisclosure") {
        selectedFormNames.push(form.form.formKey);
      }
    });
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/invitations`,
        {
          method: "POST",
          body: JSON.stringify({
            patient_id: id,
            forms:
              incompleteForms !== undefined
                ? incompleteForms
                : selectedFormNames,
            sendSms: sendSms === true,
            sendEmail: sendEmail === true,
          }),
        }
      ).then((res) => res.json());
      if (response.success) {
        return response.data;
      } else {
        throw Error(
          "An unexpected error occurred while attempting to generate the invite link"
        );
      }
    } catch (e) {
      throw Error(
        "An unexpected error occurred while attempting to generate the invite link"
      );
    }
  });

  @action
  setSectionToGroupAdditionSuccessful(value) {
    this.sectionToGroupAdditionSuccessful = value;
  }

  @action
  setSectionToGroupAdditionUnsuccessful(value) {
    this.sectionToGroupAdditionUnsuccessful = value;
  }

  addSectionsToGroup = flow(function* (groupId, formKey) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${groupId}/item/${formKey}`,
        {
          method: "POST",
        }
      ).then((res) => res.json());
      if (!response.success) {
        if (
          response.error.DetailedMessage.sqlMessage.includes("already exists")
        ) {
          throw Error("Form already exists in this group");
        }
        throw Error(
          "An unexpected error occurred while attempting to add section(s) to the group(s)"
        );
      } else {
        this.setSectionToGroupAdditionSuccessful(true);
      }
      this.resetSectionsToAddToGroups();
    } catch (err) {
      this.setSectionToGroupAdditionUnsuccessful(true);
      this.resetSectionsToAddToGroups();
      throw Error(err);
    }
  });

  removeSectionFromGroup = flow(function* (groupId, formKey) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${groupId}/item/${formKey}`,
        {
          method: "DELETE",
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to delete section from the group"
        );
      }
    } catch (err) {
      throw Error(err.message);
    }
  });

  changeSectionArchiveStatus = flow(function* (formAction, formKey) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formAction}`,
        {
          method: "POST",
          body: JSON.stringify({
            formId: formKey,
          }),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to change the section status"
        );
      }
    } catch (err) {
      throw Error(err.message);
    }
  });

  sendGroupToPatients = flow(function* (groupId) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${groupId}/item`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to send the group"
        );
      } else {
        if (response.data.length === 0) {
          return { status: "Empty group" };
        } else {
          let allFormSections = response.data.map((section) => {
            const formData = this.get([{}, section.form_key]);
            return formData;
          });
          allFormSections.forEach((section, index) => {
            this.selectedSections.push({
              index,
              form: {
                estimatedCompletionTime: section.estimatedCompletionTime,
                formKey: section.formKey,
                name: section.name,
              },
            });
          });
          return { status: "Success" };
        }
      }
    } catch (err) {
      throw Error(err);
    }
  });

  @action
  setShowArchived(value) {
    this.showArchived = value;
  }

  @action
  setSearchItem(value) {
    this.searchItem = value;
  }

  @action
  setEmptyGroup(value) {
    this.emptyGroup = value;
  }

  @action
  setEmptySection(value) {
    this.emptySection = value;
  }

  fetchSectionsOfSelectedGroup = flow(function* (group) {
    try {
      this.loading = true;
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${group.id}/item`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the sections"
        );
      } else {
        if (response.data.length === 0) {
          this.setEmptyGroup(true);
          this.groupedSections.set(group.id, []);
        } else {
          this.groupedSections.set(group.id, response.data);
        }
      }
      this.loading = false;
    } catch (err) {
      throw Error(err);
    }
  });

  sectionsByGroupId = createTransformer(({ groupId, archived = false }) => {
    if (this.groupedSections.has(groupId)) {
      let sections = this.groupedSections.get(groupId);
      let formKeys = sections.map((section) => section.form_key);
      if (formKeys.length === 0) return [];

      let orderedSections = [];
      formKeys.filter((key) => {
        Object.values(this.datum).filter((section) => {
          if (key === section.formKey && section.archived === archived) {
            orderedSections.push(section);
          }
          return null;
        });
        return null;
      });
      return orderedSections;
    }
    return [];
  });

  @action
  resetPatientsInvitationList() {
    this.patientsInvitationList.clear();
  }

  @action
  updatePatientsList(patientData) {
    let patientsListCopy = [...this.patientsInvitationList];
    let count = 0;
    if (patientsListCopy.length > 0) {
      patientsListCopy.forEach((patient) => {
        if (patient.id === patientData.id) {
          patient["SMS"] = patientData["SMS"];
          patient["Email"] = patientData["Email"];
        } else {
          count += 1;
        }
      });
      if (count === patientsListCopy.length) {
        patientsListCopy.push(patientData);
      }
    } else {
      patientsListCopy.push(patientData);
    }
    this.resetPatientsInvitationList();
    patientsListCopy.forEach((patient, index) => {
      if (!patient["SMS"] && !patient["Email"]) {
        patientsListCopy.splice(index, 1);
      } else {
        this.patientsInvitationList.push(patient);
      }
    });
  }

  getPatientInPatientsInvitationList = createTransformer(({ id }) => {
    return this.patientsInvitationList.filter((patient) => {
      return patient.id === id;
    });
  });

  updateReorderedSections = flow(function* (groupId, formKey, newIndex) {
    const archivedGroups = this.sectionsByGroupId({ groupId, archived: true });
    const archivedGroupsCount = archivedGroups.length;
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${groupId}/item/${formKey}/reorder/${
          newIndex + archivedGroupsCount
        }`,
        {
          method: "PUT",
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to reorder sections from the group"
        );
      }
    } catch (e) {
      throw Error(e);
    }
  });

  updateReorderedAllSections = flow(function* (formKey, newIndex) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formKey}/reorder/${newIndex}`,
        {
          method: "PUT",
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to reorder sections from the group"
        );
      }
    } catch (e) {
      throw Error(e);
    }
  });

  async getTenantPin() {
    try {
      const response = await this.fetch(`${CONSTANTS.FORMS_API_URL}/pin`).then(
        (res) => res.json()
      );

      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch pin"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  async fetchFormById(formId, token) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formId}`,
        { method: "GET" },
        token
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the form"
        );
      } else {
        return response.data.form_json;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the form"
      );
    }
  }

  async fetchSingleFormById(formId, token) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formId}`,
        { method: "GET" },
        token
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the form"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw err.message;
    }
  }

  /**
   * Fetch paperless forms config
   * @returns {Object}
   */
  async getFoldersForMapping() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.OFFICE_API_URL}/definitions?${new URLSearchParams({
          category: "ImageCats",
        }).toString()}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch folders for mapping!"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Fetch paperless forms config
   * @param {String} config
   * @returns {Object}
   */
  async getPaperlessFormConfig(config) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/paperless-config?${new URLSearchParams({
          configs: config,
        }).toString()}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the paperless forms configs!"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update office configs
   * @param {Object} reqObj
   * @returns {Object}
   */
  async updatePaperlessFormConfigs(reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/paperless-config`,
        {
          method: "PUT",
          body: JSON.stringify(reqObj),
        }
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to update paperless form configs!"
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Fetch paperless forms meta
   * @returns {Object}
   */
  async getFormsMeta() {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms?${new URLSearchParams({
          metaOnly: true,
        }).toString()}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to fetch the paperless forms!"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw e.message;
    }
  }

  /**
   * Update paperless forms OD folder mapping
   * @param {Object} reqObj
   * @returns {Object}
   */
  async updateFormMapping(formId, reqObj) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms/${formId}`,
        {
          method: "PUT",
          body: JSON.stringify(reqObj),
        }
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          response.error.DetailedMessage ||
            "An unexpected error occurred while attempting to update paperless form OD mapping!"
        );
      } else {
        return response;
      }
    } catch (e) {
      throw e.message;
    }
  }

  async fetchFormForPrintPreview(formId, secret, formSpecific) {
    try {
      const response = await this.fetch(
        `${
          CONSTANTS.FORMS_API_URL
        }/public/forms/preview-data?${new URLSearchParams({
          formId: formId,
          secret: secret,
          formSpecific: formSpecific,
        }).toString()}`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the form"
        );
      } else {
        if (!response.data.formData) {
          this.iterate(response.data.form.form_json);
        }
        response.data.form.form_json = JSON.parse(
          JSON.stringify(response.data.form.form_json).replace(
            /buttonStyledRadioButton/gi,
            "radio"
          )
        );

        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the form"
      );
    }
  }

  async fetchFormByFormKey(formKey) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/forms?${new URLSearchParams({
          key: formKey,
        }).toString()}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the form"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the form"
      );
    }
  }

  iterate(obj) {
    Object.keys(obj).forEach((key) => {
      if (key === "conditional" || key === "customConditional") {
        obj[key] = {};
      }
      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        obj[key] !== "conditional"
      ) {
        this.iterate(obj[key]);
      }
    });
  }

  async fetchMedicalConditions() {
    try {
      this.loading = true;
      const response = await this.fetch(
        `${CONSTANTS.FORMS_API_URL}/suggestions/medical-conditions`,
        null,
        null,
        AUTHORIZATION_TYPE.TENANT
      ).then((res) => res.json());
      this.loading = false;
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch medical conditions"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      this.loading = false;
      throw Error(
        "An unexpected error occurred while attempting to fetch medical conditions"
      );
    }
  }

  async printSelectedForms() {
    try {
      this.generatingPdf = true;
      this.ui_ref = uuidv4();
      const formUuids = this.selectedSections
        .map((section) => section.form.file_uuid)
        .filter((a) => a);
      const isSingleForm = formUuids.length === 1;
      const response = isSingleForm
        ? await this.fetch(
            `${CONSTANTS.MEDIA_API_URL}/files/${formUuids.join()}/download`
          ).then((res) => res.json())
        : await this.fetch(
            `${CONSTANTS.MEDIA_API_URL}/files/merge?${new URLSearchParams({
              uuids: formUuids.join(),
              ui_ref: this.ui_ref,
            }).toString()}`
          ).then((res) => res.json());

      if (!response.success && !isSingleForm) {
        throw Error(
          "An unexpected error occurred while printing selected forms"
        );
      } else {
        if (isSingleForm) {
          this.generatingPdf = false;
          this.generatedPdfUrl = response.url;
        } else {
          return response.data;
        }
      }
    } catch (err) {
      this.generatingPdf = false;
      throw Error("An unexpected error occurred while printing selected forms");
    }
  }
  async printSingleForm() {
    try {
      this.generatingPdf = true;
      this.ui_ref = uuidv4();
      const formUuids = this.printingData.file_uuid;

      const response = await this.fetch(
        `${CONSTANTS.MEDIA_API_URL}/files/${formUuids}/download`
      ).then((res) => res.json());
      this.generatingPdf = false;
      this.generatedPdfUrl = response.url;
    } catch (err) {
      console.error(err.message);
      this.generatingPdf = false;
      throw Error("An unexpected error occurred while printing selected forms");
    }
  }
  handlePrintFCM(body) {
    this.generatingPdf = false;
    if (body && body.data) {
      if (body.ui_ref === this.ui_ref) {
        this.generatedPdfUrl = body.data;
      }
    } else {
      this.store.notification.showError("Error while generating PDF");
    }
  }
  async fetchReferredBy() {
    this.loading = true;
    const response = await this.fetch(
      `${CONSTANTS.OFFICE_API_URL}/public/referrals?notPerson=1`,
      null,
      null,
      AUTHORIZATION_TYPE.TENANT
    ).then((res) => res.json());
    this.loading = false;
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to fetch referrals list"
      );
    } else {
      return response.data;
    }
  }
  catch(err) {
    this.loading = false;
    throw Error(
      "An unexpected error occurred while attempting to fetch referrals list"
    );
  }
}
