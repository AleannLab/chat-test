import Resource from './utils/resource';
import { createTransformer } from 'mobx-utils';
import { serializeToQueryString } from 'helpers/misc';
import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';

export class Utils extends Resource {
  constructor(store) {
    super(store);
    this.store = store;
  }

  getUserUuid = (member, users) => {
    return users?.find((x) => x.email === member?.name)?.display_image;
  };

  getFirstLastSeparateName = (displayName) => {
    return displayName.split(' ');
  };

  prepareMediaUrl = createTransformer(
    ({ uuid, authToken, orElse, redirect = true }) => {
      if (!uuid || !authToken) return orElse ? orElse : null;
      // let session = await this.authentication.refreshAndGetSession({});
      const params = {
        redirect: redirect,
        'x-custom-tenant-id':
          CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0],
        authorization: `Bearer ${authToken}`,
        AuthorizationType: AUTHORIZATION_TYPE.USER,
      };

      return `${
        CONSTANTS.MEDIA_API_URL
      }/files/${uuid}/download${serializeToQueryString(params)}`;
    },
  );
}
