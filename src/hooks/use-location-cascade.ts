"use client";

import { useEffect, useState } from "react";
import { getLocations } from "@/servers/location";

export interface LocationOption {
	id: string;
	name: string;
}

export function useLocationCascade() {
	const [regionId, setRegionId] = useState("");
	const [stateId, setStateId] = useState("");
	const [cityId, setCityId] = useState("");
	const [regions, setRegions] = useState<LocationOption[]>([]);
	const [states, setStates] = useState<LocationOption[]>([]);
	const [cities, setCities] = useState<LocationOption[]>([]);

	useEffect(() => {
		getLocations(null).then(setRegions);
	}, []);

	useEffect(() => {
		if (regionId) getLocations(regionId).then(setStates);
		else setStates([]);
	}, [regionId]);

	useEffect(() => {
		if (stateId) getLocations(stateId).then(setCities);
		else setCities([]);
	}, [stateId]);

	const selectRegion = (id: string) => {
		setRegionId(id);
		setStateId("");
		setCityId("");
	};

	const selectState = (id: string) => {
		setStateId(id);
		setCityId("");
	};

	const selectCity = (id: string) => setCityId(id);

	const setAll = (region: string, state: string, city: string) => {
		setRegionId(region);
		setStateId(state);
		setCityId(city);
	};

	return {
		regionId,
		stateId,
		cityId,
		regions,
		states,
		cities,
		selectRegion,
		selectState,
		selectCity,
		setAll,
		locationId: cityId,
	};
}
