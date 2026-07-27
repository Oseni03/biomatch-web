import { useQuery } from "@tanstack/react-query";
import { getHospitalBankByOrganizationId } from "@/servers/hospital";

export function useMyHospitalBank(organizationId?: string) {
	return useQuery({
		queryKey: ["my-hospital-bank", organizationId],
		queryFn: () =>
			getHospitalBankByOrganizationId(organizationId as string),
		enabled: !!organizationId,
	});
}
