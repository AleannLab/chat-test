import CONSTANTS from "helpers/constants";
import { action, flow, observable } from "mobx";
import Resource from "./utils/resource";
import { nanoid } from "nanoid";

export class CreateIvr extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  ivr = null;

  newState = {
    id: nanoid(),
    key: "none",
    parent: "",
    action: "none",
    actionValue: "",
    failoverTime: null,
    failoverAction: "none",
    failoverValue: "",
  };

  initialState = {
    id: nanoid(),
    audio: "",
    parent: "",
  };

  ivrTree = [];

  selectedIvrGreeting = "";

  @action
  setSelectedIvrGreeting = (ivr) => {
    this.selectedIvrGreeting = ivr;
  };

  @action
  setIvrTree = (ivrTreeArr) => {
    const ivrTree = this.hierarchy(ivrTreeArr);
    this.ivrTree = ivrTree;
  };

  @action
  hierarchy = (data) => {
    const tree = [];
    const childOf = {};
    data.forEach((item) => {
      const { id, parent } = item;
      childOf[id] = childOf[id] || [];
      item.children = childOf[id];
      if (parent) {
        (childOf[parent] = childOf[parent] || []).push(item);
      } else {
        tree.push(item);
      }
    });
    return tree;
  };

  /* This function is used to add new contact */
  addNewIvr = flow(function* (data) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(response.error?.Message);
      }
      yield this.fetchList();
      return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  async getIvrInfo(id) {
    try {
      const response = await this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/${id}`,
        {
          method: "GET",
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to get the Group Info"
        );
      } else {
        return response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to get the Group Info"
      );
    }
  }

  fetchIvrInformation = flow(function* (id) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/${id}`
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch the office details"
        );
      } else {
        this.ivr = response.data;
      }
    } catch (err) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the office details"
      );
    }
  });

  updateIvr = flow(function* ({ id, data }) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/ivr/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(response.error?.Message);
      }
      yield this.fetchList();
      return response;
    } catch (e) {
      console.error(e);
      throw Error(e);
    }
  });

  resetIvr = () => {
    this.ivr = null;
  };
}
