import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { ac, orgRoles } from "./organization-access";
import type { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({ ac, roles: orgRoles })
  ]
});
