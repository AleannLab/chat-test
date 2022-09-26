import CONSTANTS from 'helpers/constants';
import { flow } from 'mobx';
import Resource from './utils/resource';

export class PurchaseNumber extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  searchNumbers = flow(function* (data) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office/twilio/numbers`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.Message ??
            'An unexpected error occurred while fetching numbers',
        );
      }
      return response?.data;
    } catch (e) {
      throw 'An unexpected error occurred while fetching numbers';
    }
  });

  buyNumber = flow(function* (data) {
    try {
      const response = yield this.fetch(
        `${CONSTANTS.CALL_CONTROL_API_URL}/office/twilio/buy-number`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        },
      ).then((res) => res.json());
      if (!response.success) {
        throw Error(
          response.error?.Message ??
            'An unexpected error occurred while purchasing number',
        );
      }
      return response;
    } catch (e) {
      throw 'An unexpected error occurred while purchasing number';
    }
  });
}
