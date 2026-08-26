"use client";

import { MapPin, Clock } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Switch } from "@/components/ui/switch";
import { Field, inputClass } from "./form-fields";
import { AVAILABILITY_OPTIONS } from "@/lib/availability";
import type { Availability } from "@generated/prisma/enums";
import type { useLocationCascade } from "@/hooks/use-location-cascade";

interface EmergencyPreferencesSectionProps {
	cascade: ReturnType<typeof useLocationCascade>;
	availability: Availability | "";
	onAvailabilityChange: (value: Availability | "") => void;
	isActive: boolean;
	onIsActiveChange: (value: boolean) => void;
}

export function EmergencyPreferencesSection({
	cascade,
	availability,
	onAvailabilityChange,
	isActive,
	onIsActiveChange,
}: EmergencyPreferencesSectionProps) {
	return (
		<SectionCard icon={MapPin} title="Emergency Preferences">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Region" icon={MapPin}>
					<select
						value={cascade.regionId}
						onChange={(e) => cascade.selectRegion(e.target.value)}
						className={inputClass}
					>
						<option value="">Select region</option>
						{cascade.regions.map((r) => (
							<option key={r.id} value={r.id}>
								{r.name}
							</option>
						))}
					</select>
				</Field>
				<Field label="State">
					<select
						value={cascade.stateId}
						onChange={(e) => cascade.selectState(e.target.value)}
						disabled={!cascade.regionId}
						className={inputClass}
					>
						<option value="">Select state</option>
						{cascade.states.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</Field>
				<Field label="City / Area">
					<select
						value={cascade.cityId}
						onChange={(e) => cascade.selectCity(e.target.value)}
						disabled={!cascade.stateId}
						className={inputClass}
					>
						<option value="">Select city</option>
						{cascade.cities.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</Field>
				<Field label="Availability" icon={Clock}>
					<select
						value={availability}
						onChange={(e) =>
							onAvailabilityChange(
								e.target.value as Availability | "",
							)
						}
						className={inputClass}
					>
						<option value="">Not specified</option>
						{AVAILABILITY_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</Field>
			</div>
			<div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
				<div>
					<span className="block text-sm font-medium text-foreground">
						Pause emergency alerts
					</span>
					<span className="mt-0.5 block text-xs text-muted-foreground">
						When paused, you won&apos;t receive emergency donation
						requests.
					</span>
				</div>
				<Switch
					checked={!isActive}
					onCheckedChange={(checked) => onIsActiveChange(!checked)}
				/>
			</div>
		</SectionCard>
	);
}
