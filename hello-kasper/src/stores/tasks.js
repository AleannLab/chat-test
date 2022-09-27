import CONSTANTS, { TASK_STATE } from "helpers/constants";
import { serializeToQueryString } from "helpers/misc";
import { flow, observable } from "mobx";
import { createTransformer } from "mobx-utils";
import Resource from "./utils/resource";
import { convertCurrentTime } from "helpers/timezone";
import moment from "moment-timezone";
import { v4 as uuidv4 } from "uuid";

export class Task extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  ui_ref = uuidv4();

  detailedTaskInfo = null;
  currentlySelectedTaskForInfo = null;
  currentlySelectedTaskCategory = null;

  listApiHandler = async (params) => {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/tasks${serializeToQueryString(params)}`
    ).then((r) => r.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to fetch the tasks"
      );
    } else {
      return response.data;
    }
  };

  isOverdue = (dateObj) => {
    const date1 = moment.utc(dateObj).format("LL");
    const date2 = convertCurrentTime({ shouldFormat: true, format: "LL" });
    return moment(date1).isBefore(date2);
  };

  getTasksByStatus = createTransformer(({ state }) => {
    let tasks = this.data;
    switch (state) {
      case TASK_STATE.todo:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            !this.isOverdue(this.datum[singleData].due_date)
        );
        break;

      case TASK_STATE.overdue:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            this.isOverdue(this.datum[singleData].due_date)
        );
        break;

      case TASK_STATE.completed:
        tasks = this.data.filter(
          (singleData) => !!this.datum[singleData].completed
        );
        break;

      default:
        break;
    }
    return tasks;
  });

  getTasksByPatient = createTransformer((id) => {
    return this.data.filter(
      (singleData) => +id === this.datum[singleData].patient_id
    );
  });

  getTasksByStatusAndAssignee = createTransformer(({ state, assignee }) => {
    let tasks = this.data;
    switch (state) {
      case TASK_STATE.todo:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            !this.isOverdue(this.datum[singleData].due_date) &&
            this.datum[singleData].assigned_to_id === assignee
        );
        break;

      case TASK_STATE.overdue:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            this.isOverdue(this.datum[singleData].due_date) &&
            this.datum[singleData].assigned_to_id === assignee
        );
        break;

      case TASK_STATE.completed:
        tasks = this.data.filter(
          (singleData) =>
            !!this.datum[singleData].completed &&
            this.datum[singleData].assigned_to_id === assignee
        );
        break;

      default:
        break;
    }
    return tasks;
  });

  getTasksByStatusAndCategory = createTransformer(({ state, categoryId }) => {
    let tasks = this.data;
    switch (state) {
      case TASK_STATE.todo:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            !this.isOverdue(this.datum[singleData].due_date) &&
            this.datum[singleData].categories.find(
              ({ id }) => id === categoryId
            )
        );
        break;

      case TASK_STATE.overdue:
        tasks = this.data.filter(
          (singleData) =>
            !this.datum[singleData].completed &&
            this.isOverdue(this.datum[singleData].due_date) &&
            this.datum[singleData].categories.find(
              ({ id }) => id === categoryId
            )
        );
        break;

      case TASK_STATE.completed:
        tasks = this.data.filter(
          (singleData) =>
            !!this.datum[singleData].completed &&
            this.datum[singleData].categories.find(
              ({ id }) => id === categoryId
            )
        );
        break;

      default:
        break;
    }
    return tasks;
  });

  async _addTaskApiHandler({
    task_name,
    description,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
    created_by,
  }) {
    const response = await this.fetch(`${CONSTANTS.TASK_API_URL}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        task_name,
        patient,
        assigned_to_id,
        categories,
        created_by,
        due_date,
        description,
        ui_ref: this.ui_ref,
      }),
    }).then((res) => res.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to add the task"
      );
    } else {
      return response;
    }
  }

  addTask = flow(function* ({
    task_name,
    description,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
  }) {
    console.log("patient for task", patient);

    try {
      yield this._addTaskApiHandler({
        task_name,
        description,
        due_date,
        patient,
        assigned_to_id,
        categories,
        created_by: this.store.authentication.user.id,
      });
    } catch (err) {
      throw Error(err.message);
    }

    yield this.fetchList({ withCategories: true });
  });

  async _editTaskApiHandler({
    task_id,
    task_name,
    description = null,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
    created_by,
  }) {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/tasks/${task_id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          task_name,
          patient,
          assigned_to_id,
          categories,
          created_by,
          due_date,
          description,
          ui_ref: this.ui_ref,
        }),
      }
    ).then((res) => res.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to edit the task"
      );
    } else {
      return response;
    }
  }

  editTask = flow(function* ({
    task_id,
    task_name,
    description,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
  }) {
    try {
      yield this._editTaskApiHandler({
        task_id,
        task_name,
        description,
        due_date,
        patient,
        assigned_to_id,
        categories,
        updated_by: this.store.authentication.user.id,
      });
    } catch (err) {
      throw Error(err.message);
    }

    yield this.fetchList({ withCategories: true });
  });

  async _taskStatusApiHandler({ task_id, completed }) {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/tasks/${task_id}`,
      {
        method: "PUT",
        body: JSON.stringify({ completed, ui_ref: this.ui_ref }),
      }
    ).then((res) => res.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to update the task"
      );
    } else {
      return response;
    }
  }

  taskStatus = flow(function* ({ task_id, completed }) {
    try {
      yield this._taskStatusApiHandler({ task_id, completed });
      this.datum[task_id].completed = completed;
    } catch (err) {
      this.notification.showError(err.message);
    }
    yield this.fetchList({ withCategories: true });
  });

  async _deleteTaskApiHandler({ task_id }) {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/tasks/${task_id}`,
      {
        method: "DELETE",
      }
    ).then((res) => res.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to delete the task"
      );
    } else {
      return response;
    }
  }

  deleteTask = flow(function* ({ task_id }) {
    try {
      this.notification.showInfo("Deleting task...");
      yield this._deleteTaskApiHandler({ task_id });
    } catch (err) {
      this.notification.showError(err.message);
    }
    this.notification.showSuccess(
      "Task deleted successfully! Refreshing Tasks List..."
    );
    setTimeout(() => {
      this.notification.hideNotification();
    }, 5000);
    yield this.fetchList({ withCategories: true });
  });

  /** New Tasks API methods to work with React Query */

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
          params
        ).toString()}`
      ).then((res) => res.json());

      if (!response.success) {
        throw Error(
          "An unexpected error occurred while attempting to fetch patient tasks"
        );
      } else {
        return response.data;
      }
    } catch (e) {
      throw Error(e);
    }
  }

  async markTaskAsComplete({ task_id, completed }) {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/tasks/${task_id}`,
      {
        method: "PUT",
        body: JSON.stringify({ completed, ui_ref: this.ui_ref }),
      }
    ).then((res) => res.json());
    if (!response.success) {
      throw Error(
        "An unexpected error occurred while attempting to update the task"
      );
    } else {
      return response;
    }
  }

  async addTaskQuery({
    task_name,
    description,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
  }) {
    try {
      const response = await this._addTaskApiHandler({
        task_name,
        description,
        due_date,
        patient,
        assigned_to_id,
        categories,
        created_by: this.store.authentication.user.id,
      });
      return response;
    } catch (err) {
      throw Error(err.message);
    }
  }

  async editTaskQuery({
    task_id,
    task_name,
    description = null,
    due_date,
    patient,
    assigned_to_id,
    categories = [],
  }) {
    try {
      const response = await this._editTaskApiHandler({
        task_id,
        task_name,
        description,
        due_date,
        patient,
        assigned_to_id,
        categories,
        updated_by: this.store.authentication.user.id,
      });
      return response;
    } catch (err) {
      throw Error(err.message);
    }
  }

  async deleteTaskQuery(task_id) {
    try {
      const response = await this._deleteTaskApiHandler({ task_id });
      return response;
    } catch (err) {
      throw Error(err.message);
    }
  }

  handleTaskAddFCM(body) {
    if (body.ui_ref !== this.ui_ref) {
      console.log("before data", this.data.length, this.datum.length);
      this.datum[body.task.id] = body.task;
      this.data.push(body.task.id);
      console.log("after data", this.data.length, this.datum.length);
    }
  }

  handleTaskUpdateFCM(body) {
    if (body.ui_ref !== this.ui_ref) {
      this.datum[body.task.id] = body.task;
    }
  }

  handleTaskDeleteFCM(body) {
    if (body.ui_ref !== this.ui_ref) {
      if (this.datum[body.id]) {
        this.data = this.data.filter((singleData) => +singleData !== body.id);
      }
    }
  }
}
