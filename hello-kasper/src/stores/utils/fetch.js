import CONSTANTS, { AUTHORIZATION_TYPE } from 'helpers/constants';

export const fetch = async (authentication, url = '', data = {}) => {
  try {
    let session = await authentication.refreshAndGetSession({});
    let result = await fetch(url, {
      ...data,
      headers: {
        'Content-Type': 'application/json',
        'x-custom-tenant-id':
          CONSTANTS.TEST_TENANT_ID || window.location.hostname.split('.')[0],
        ...(session
          ? {
              Authorization: `Bearer ${session.getAccessToken().getJwtToken()}`,
              AuthorizationType: AUTHORIZATION_TYPE.USER,
            }
          : {}),
        ...(data ? data.headers : []),
      },
    });

    // console.log("fetch status", result.status);

    if (result.status === 403) {
      authentication.logout({});
    }

    return result;
  } catch (e) {
    console.error('Fetch Error', e);
    throw Error(
      'An unexpected error occurred while attempting to fetch the resources',
    );
  }
};
