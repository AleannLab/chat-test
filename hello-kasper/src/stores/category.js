import Resource from './utils/resource';
import { createTransformer } from 'mobx-utils';
import { serializeToQueryString } from 'helpers/misc';
import CONSTANTS from 'helpers/constants';

export class Category extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  async getApiHandler(id) {
    let [patientInfo] = await Promise.all([
      this.fetch(`${CONSTANTS.OFFICE_API_URL}/patients/${id}`)
        .then((r) => r.json())
        .then((r) => r.data),
    ]);
    console.log([patientInfo]);
    // patientInfo.chats = chats;
    return patientInfo;
  }

  async listApiHandler(params) {
    var queryString = serializeToQueryString(params);

    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/categories${queryString}`,
    ).then((r) => r.json());
    return response.data;
  }

  filteredCategories = createTransformer(({ search }) => {
    if (search) return Object.values(this.datum);
    var cats = Object.values(this.datum).filter(
      (cat) =>
        cat.name && cat.name.toLowerCase().includes(search.toLowerCase()),
    );
    return cats.length >= 5 ? cats.slice(0, 5) : cats;
  });

  async _listByQueryApiHandler({ search, rows }) {
    const response = await this.fetch(
      `${CONSTANTS.TASK_API_URL}/categories?search=${encodeURIComponent(
        search,
      )}&rows=${rows}`,
    ).then((r) => r.json());
    return response.data;
  }
}
