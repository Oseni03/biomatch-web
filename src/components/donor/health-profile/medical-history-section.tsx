"use client";

import { Pill } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Field, inputClass } from "./form-fields";
import type { HealthSectionProps } from "./types";

export function MedicalHistorySection({
	health,
	updateHealth,
}: HealthSectionProps) {
	return (
		<SectionCard icon={Pill} title="Medical History">
			<div className="grid gap-4">
				<Field label="Chronic conditions">
					<textarea
						value={health.chronic_conditions}
						onChange={(e) =>
							updateHealth("chronic_conditions", e.target.value)
						}
						className={`${inputClass} min-h-[72px]`}
						placeholder="e.g. hypertension, diabetes — leave blank if none"
					/>
				</Field>
				<Field label="Allergies">
					<textarea
						value={health.allergies}
						onChange={(e) => updateHealth("allergies", e.target.value)}
						className={`${inputClass} min-h-[72px]`}
						placeholder="e.g. penicillin, latex — leave blank if none"
					/>
				</Field>
				<Field label="Current medications">
					<textarea
						value={health.current_medications}
						onChange={(e) =>
							updateHealth(
								"current_medications",
								e.target.value,
							)
						}
						className={`${inputClass} min-h-[72px]`}
						placeholder="Leave blank if none"
					/>
				</Field>
				<Field label="Recent surgery or major illness (last 6 months)">
					<textarea
						value={health.recent_surgery_or_illness}
						onChange={(e) =>
							updateHealth(
								"recent_surgery_or_illness",
								e.target.value,
							)
						}
						className={`${inputClass} min-h-[72px]`}
						placeholder="Leave blank if none"
					/>
				</Field>
			</div>
		</SectionCard>
	);
}
