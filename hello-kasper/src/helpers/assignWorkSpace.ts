import Amplify from "aws-amplify";
import { getTenantApiHandler } from "./getTenantApiHandler";
import CONSTANTS from "./constants";

const assignWorkSpace = async (args:any, setInvalidTenant:any) => {
  let tenantId =
    args.tenantId ||
    CONSTANTS.TEST_TENANT_ID ||
    window.location.hostname.split(".")[0];
  const data = await getTenantApiHandler({
    tenantId,
  });
  if (data) {
    const { clientId, userPoolId } = data;
    Amplify.configure({
      Auth: {
        userPoolWebClientId: clientId,
        userPoolId: userPoolId,
        authenticationFlowType: "USER_PASSWORD_AUTH",
      },
    });
  } else {
    setInvalidTenant(true);
  }
};

export { assignWorkSpace };
