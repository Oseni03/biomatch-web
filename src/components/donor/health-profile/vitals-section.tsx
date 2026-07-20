"use client";

import { Activity, Ruler, Weight } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Field, inputClass } from "./form-fields";
import type { HealthSectionProps } from "./types";

export function VitalsSection({ health, updateHealth }: HealthSectionProps) {
	return (
		<SectionCard icon={Activity} title="Vitals">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Height (cm)" icon={Ruler}>
					<input
						type="number"
						min="0"
						value={health.height_cm}
						onChange={(e) => updateHealth("height_cm", e.target.value)}
						className={inputClass}
					/>
				</Field>
				<Field label="Weight (kg)" icon={Weight}>
					<input
						type="number"
						min="0"
						value={health.weight_kg}
						onChange={(e) => updateHealth("weight_kg", e.target.value)}
						className={inputClass}
					/>
				</Field>
				<Field label="Blood pressure (e.g. 120/80)">
					<input
						value={health.blood_pressure}
						onChange={(e) =>
							updateHealth("blood_pressure", e.target.value)
						}
						className={inputClass}
						placeholder="120/80"
					/>
				</Field>
				<Field label="Resting heart rate (bpm)">
					<input
						type="number"
						min="0"
						value={health.resting_heart_rate}
						onChange={(e) =>
							updateHealth("resting_heart_rate", e.target.value)
						}
						className={inputClass}
					/>
				</Field>
			</div>
		</SectionCard>
	);
}
