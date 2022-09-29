import CONSTANTS, { AUTHORIZATION_TYPE } from "./constants";

const getTenantApiHandler = async ({ tenantId }:any) => {
  const result = await fetch(`${CONSTANTS.ADMIN_API_URL}/office/aws`, {
    method: "GET",
    headers: {
      "x-custom-tenant-id": tenantId,
      Authorization: `Bearer ${CONSTANTS.ENV}-${tenantId}-tenant`,
      AuthorizationType: AUTHORIZATION_TYPE.TENANT,
      "Content-Type": "application/json",
    },
  }).then((r) => r.json());

  if (result.status === 403) {
    // stores.notification.showError("Invalid office.");
    return null;
  } else {
    return result.data;
  }
};

export { getTenantApiHandler };
