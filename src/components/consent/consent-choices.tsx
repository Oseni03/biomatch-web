"use client";

import { Checkbox } from "@/components/ui/checkbox";

export interface ConsentChoices {
	terms: boolean;
	privacy: boolean;
	dataProcessing: boolean;
	marketing: boolean;
}

export const EMPTY_CONSENT_CHOICES: ConsentChoices = {
	terms: false,
	privacy: false,
	dataProcessing: false,
	marketing: false,
};

export function requiredConsentsAccepted(choices: ConsentChoices): boolean {
	return choices.terms && choices.privacy && choices.dataProcessing;
}

function Row({
	id,
	checked,
	onChange,
	title,
	detail,
	required,
}: {
	id: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	title: string;
	detail: string;
	required?: boolean;
}) {
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-4">
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(value) => onChange(value === true)}
				required={required}
				aria-required={required || undefined}
				className="mt-0.5"
			/>
			<div className="space-y-0.5">
				<label
					htmlFor={id}
					className="cursor-pointer text-sm font-medium text-foreground"
				>
					{title}{" "}
					{required && <span className="text-brand">*</span>}
					{!required && (
						<span className="text-xs font-normal text-muted-foreground">
							(optional)
						</span>
					)}
				</label>
				<p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
			</div>
		</div>
	);
}

export function ConsentChoicesFields({
	value,
	onChange,
	idPrefix,
}: {
	value: ConsentChoices;
	onChange: (next: ConsentChoices) => void;
	idPrefix: string;
}) {
	return (
		<div className="space-y-3">
			<Row
				id={`${idPrefix}-terms`}
				checked={value.terms}
				onChange={(checked) => onChange({ ...value, terms: checked })}
				title="I accept the Terms of Service"
				detail="The rules for using BioMatch as a donor or hospital partner."
				required
			/>
			<Row
				id={`${idPrefix}-privacy`}
				checked={value.privacy}
				onChange={(checked) => onChange({ ...value, privacy: checked })}
				title="I accept the Privacy Policy"
				detail="How BioMatch collects, uses and protects your personal data."
				required
			/>
			<Row
				id={`${idPrefix}-data`}
				checked={value.dataProcessing}
				onChange={(checked) =>
					onChange({ ...value, dataProcessing: checked })
				}
				title="I consent to data processing for emergency matching"
				detail="Permission to process your profile data to match you with blood emergencies, as required by NDPR."
				required
			/>
			<Row
				id={`${idPrefix}-marketing`}
				checked={value.marketing}
				onChange={(checked) => onChange({ ...value, marketing: checked })}
				title="Send me product updates"
				detail="Occasional messages about new BioMatch features. You can opt out anytime from settings."
			/>
		</div>
	);
}
