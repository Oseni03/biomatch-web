"use client";

import { AlertTriangle } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Checkbox } from "./form-fields";
import type { HealthSectionProps } from "./types";

export function EligibilityScreeningSection({
	health,
	updateHealth,
}: HealthSectionProps) {
	return (
		<SectionCard icon={AlertTriangle} title="Eligibility Screening">
			<div className="space-y-3">
				<Checkbox
					label="Currently pregnant or nursing"
					checked={health.is_pregnant_or_nursing}
					onChange={(v) => updateHealth("is_pregnant_or_nursing", v)}
				/>
				<Checkbox
					label="Smokes or uses tobacco products"
					checked={health.smokes_or_uses_tobacco}
					onChange={(v) => updateHealth("smokes_or_uses_tobacco", v)}
				/>
				<Checkbox
					label="Traveled to a malaria-risk area in the last 12 months"
					checked={health.travel_history_malaria_zone}
					onChange={(v) =>
						updateHealth("travel_history_malaria_zone", v)
					}
				/>
			</div>
		</SectionCard>
	);
}
