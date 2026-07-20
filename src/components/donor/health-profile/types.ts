export interface HealthInfo {
	height_cm: string;
	weight_kg: string;
	blood_pressure: string;
	resting_heart_rate: string;
	chronic_conditions: string;
	allergies: string;
	current_medications: string;
	recent_surgery_or_illness: string;
	is_pregnant_or_nursing: boolean;
	smokes_or_uses_tobacco: boolean;
	travel_history_malaria_zone: boolean;
	last_screening_date: string;
	last_screening_notes: string;
}

export const EMPTY_HEALTH: HealthInfo = {
	height_cm: "",
	weight_kg: "",
	blood_pressure: "",
	resting_heart_rate: "",
	chronic_conditions: "",
	allergies: "",
	current_medications: "",
	recent_surgery_or_illness: "",
	is_pregnant_or_nursing: false,
	smokes_or_uses_tobacco: false,
	travel_history_malaria_zone: false,
	last_screening_date: "",
	last_screening_notes: "",
};

export interface HealthSectionProps {
	health: HealthInfo;
	updateHealth: <K extends keyof HealthInfo>(
		key: K,
		value: HealthInfo[K],
	) => void;
}
