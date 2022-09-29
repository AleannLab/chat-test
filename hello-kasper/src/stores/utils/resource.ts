import { get as _get } from "lodash";
import CONSTANTS, { AUTHORIZATION_TYPE } from "../../helpers/constants";
import { capitalizeFirstLetter, guidGenerator } from "../../helpers/misc";
import ErrorLogs from "../../helpers/errorLogs";
import { refreshAndGetSession } from "../../helpers/refreshAndGetSession";

export class Resource {
  store: any;
  constructor(store: any) {
    this.store = store;
  }
  async fetch(
    url = "",
    data: any = {},
    token:string = '',
    authType = AUTHORIZATION_TYPE.USER
  ) {
    const INTERACTION_ID = guidGenerator();
    try {
      let session = null;
      const tenantId =
        CONSTANTS.TEST_TENANT_ID || window.location.hostname.split(".")[0];

      if (authType === AUTHORIZATION_TYPE.TENANT) {
        token = `${CONSTANTS.ENV}-${tenantId}-tenant`;
      } else {
        session = await refreshAndGetSession();
      }

      let result = await fetch(url, {
        ...data,
        headers: {
          "Content-Type": "application/json",
          "x-custom-tenant-id": tenantId,
          "x-interaction-id": INTERACTION_ID,
          ...(session
            ? {
                Authorization: `Bearer ${session
                  .getAccessToken()
                  .getJwtToken()}`,
                AuthorizationType: authType,
              }
            : token
            ? {
                Authorization: `Bearer ${token}`,
                AuthorizationType: authType,
              }
            : {}),
          ...(data ? data.headers : []),
        },
      });

      if (result.status === 403) {
      } else if (result.status !== 200) {
        ErrorLogs.captureException(`API Error`, INTERACTION_ID);
      }

      return result;
    } catch (e) {
      if (e.name !== "AbortError") {
        ErrorLogs.captureException(e.message, INTERACTION_ID);
        throw Error(
          "An unexpected error occurred while attempting to fetch the resources"
        );
      }
    }
  }
}

export default Resource;
