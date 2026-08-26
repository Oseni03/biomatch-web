"use client";

import { Droplet } from "lucide-react";
import { SectionCard } from "@/components/dashboard/section-card";
import { Field, inputClass } from "./form-fields";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];

interface IdentitySectionProps {
	fullName: string;
	onFullNameChange: (value: string) => void;
	bloodGroup: string;
	onBloodGroupChange: (value: string) => void;
	genotype: string;
	onGenotypeChange: (value: string) => void;
	lastDonationDate: string;
	onLastDonationDateChange: (value: string) => void;
}

export function IdentitySection({
	fullName,
	onFullNameChange,
	bloodGroup,
	onBloodGroupChange,
	genotype,
	onGenotypeChange,
	lastDonationDate,
	onLastDonationDateChange,
}: IdentitySectionProps) {
	return (
		<SectionCard icon={Droplet} title="Identity & Blood Type">
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Full name">
					<input
						required
						value={fullName}
						onChange={(e) => onFullNameChange(e.target.value)}
						className={inputClass}
					/>
				</Field>
				<Field label="Blood group">
					<select
						value={bloodGroup}
						onChange={(e) => onBloodGroupChange(e.target.value)}
						className={inputClass}
					>
						<option value="">Unknown / not tested</option>
						{BLOOD_GROUPS.map((g) => (
							<option key={g} value={g}>
								{g}
							</option>
						))}
					</select>
				</Field>
				<Field label="Genotype">
					<select
						value={genotype}
						onChange={(e) => onGenotypeChange(e.target.value)}
						className={inputClass}
					>
						<option value="">Unknown / not tested</option>
						{GENOTYPES.map((g) => (
							<option key={g} value={g}>
								{g}
							</option>
						))}
					</select>
				</Field>
				<Field label="Last donation date">
					<input
						type="date"
						value={lastDonationDate}
						onChange={(e) => onLastDonationDateChange(e.target.value)}
						className={inputClass}
					/>
				</Field>
			</div>
		</SectionCard>
	);
}
