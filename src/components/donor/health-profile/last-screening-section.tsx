"use client";

import { CalendarClock } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Field, inputClass } from "./form-fields";
import type { HealthSectionProps } from "./types";

export function LastScreeningSection({
	health,
	updateHealth,
}: HealthSectionProps) {
	return (
		<SectionCard icon={CalendarClock} title="Last Medical Screening">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Screening date">
					<input
						type="date"
						value={health.last_screening_date}
						onChange={(e) =>
							updateHealth("last_screening_date", e.target.value)
						}
						className={inputClass}
					/>
				</Field>
				<Field label="Notes / results" className="sm:col-span-2">
					<textarea
						value={health.last_screening_notes}
						onChange={(e) =>
							updateHealth(
								"last_screening_notes",
								e.target.value,
							)
						}
						className={`${inputClass} min-h-[72px]`}
						placeholder="Any notes from your last checkup or blood screening"
					/>
				</Field>
			</div>
		</SectionCard>
	);
}
