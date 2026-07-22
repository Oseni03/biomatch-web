import { useQuery } from "@tanstack/react-query";
import { getHospitalBankByManagedById } from "@/servers/hospital";

export function useMyHospitalBank(userId?: string) {
	return useQuery({
		queryKey: ["my-hospital-bank", userId],
		queryFn: () => getHospitalBankByManagedById(userId as string),
		enabled: !!userId,
	});
}
