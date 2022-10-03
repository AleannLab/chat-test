import CONSTANTS from 'helpers/constants';
import { serializeToQueryString } from 'helpers/misc';
import Resource from './utils/resource';

// This is store object for contacts
export class Contacts extends Resource {
  // This function is used to add new contact
  async createApiHandler(data) {
    let response = await this.fetch(`${CONSTANTS.CONTACTS_API_URL}/contacts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.notification.showSuccess('Contact saved successfully.');
    return await response.json();
  }

  // This function is used to get all contacts
  async listApiHandler(params) {
    var queryString = serializeToQueryString(params);
    let response = await this.fetch(
      `${CONSTANTS.CONTACTS_API_URL}/contacts${queryString}`,
    ).then((r) => r.json());
    return response;
  }

  // This function is used to delete selected contact
  async deleteApiHandler(data) {
    let queryString = data;
    let response = await this.fetch(
      `${CONSTANTS.CONTACTS_API_URL}/contacts/${queryString}`,
      {
        method: 'DELETE',
      },
    );
    this.notification.showSuccess('Contact deleted successfully.');
    return response;
  }
}
