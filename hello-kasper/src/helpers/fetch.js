import { store } from 'stores';
import Resource from 'stores/utils/resource';
import CONSTANTS from '../helpers/constants';

const resource = new Resource(store);

export const fetch = async (path, data) => {
  const url = new URL(path);

  const { query } = data;
  if (query) {
    if (typeof query !== 'object') throw new Error('query must be an object');

    Object.keys(query).forEach((key) => url.searchParams.set(key, query[key]));
  }

  let response = await resource.fetch(url.toString(), data);
  if (response.headers.get('content-type').indexOf('application/json') !== -1) {
    response = await response.json();
  }

  return response;
};

