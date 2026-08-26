import { useQuery } from "@tanstack/react-query";
import { getAllCityLabels } from "@/servers/location";

export function useCityLabels() {
	return useQuery({
		queryKey: ["city-labels"],
		queryFn: () => getAllCityLabels(),
		staleTime: Infinity,
	});
}
