import Resource from "./utils/resource";
import { createTransformer } from "mobx-utils";
import { serializeToQueryString } from "helpers/misc";
import { observable, flow, action } from "mobx";
import CONSTANTS from "helpers/constants";

export class FormGroups extends Resource {
  ALL_SECTIONS = {
    id: "all_sections",
    name: "All Sections",
  };

  selectedGroup = this.ALL_SECTIONS;
  showArchived = false;

  constructor(store) {
    super(store);
    this.store = store;
  }

  @action.bound
  setShowArchived = (showArchived) => {
    this.showArchived = showArchived;
  };

  async getApiHandler(id) {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    console.log([patientInfo]);
    return patientInfo;
  }

  async listApiHandler(params) {
    const response = await this.fetch(
      `${CONSTANTS.FORMS_API_URL}/group${serializeToQueryString(params)}`
    ).then((r) => r.json());
    return response.data;
  }

  listGroups = createTransformer(({ showArchived }) => {
    let groups = this.data.filter((groupId) => {
      return this.datum[groupId].archived === (showArchived === true ? 1 : 0);
    });
    // if (prepend) { groups.unshift(prepend); }

    return groups;
  });

  @action.bound
  setSelectedGroup = (group) => {
    this.selectedGroup = group;
  };

  changeGroupArchiveStatus = flow(function* (id, status) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            archived: status,
          }),
        }
      ).then((res) => res.json());
      yield this.fetchList();
      return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  renameGroup = flow(function* (id, name) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.FORMS_API_URL}/group/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: name,
          }),
        }
      ).then((res) => res.json());
      yield this.fetchList();
      return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  addNewGroup = flow(function* (groupName) {
    try {
      const response = yield this.fetch(`${CONSTANTS.FORMS_API_URL}/group`, {
        method: "POST",
        body: JSON.stringify({
          name: groupName,
        }),
      }).then((res) => res.json());
      yield this.fetchList();
      return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });
}
