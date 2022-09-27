import { observable } from "mobx";

export default class AsyncStore {
  fetch(url = "", data = {}) {
    console.log(url, data);
    return fetch(url, data);
  }

  params;
  data;
  error;
  loading = false;
  loaded = false;

  reset = () => {
    this.params = null;
    this.data = null;
    this.error = null;
    this.loaded = false;
    this.loading = false;
  };
}
