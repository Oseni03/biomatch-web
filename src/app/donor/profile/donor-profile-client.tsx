"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useDonorDashboard } from "@/hooks/use-donor-dashboard";
import { updateUserProfile } from "@/servers/user";
import { displayBloodGroup } from "@/lib/donor-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const BLOOD_GROUPS = [
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
] as const;

type BloodGroupLabel = (typeof BLOOD_GROUPS)[number];

const BLOOD_GROUP_OPTIONS = BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }));

const BG_TO_ENUM: Record<BloodGroupLabel, string> = {
	"A+": "A_PLUS",
	"A-": "A_MINUS",
	"B+": "B_PLUS",
	"B-": "B_MINUS",
	"AB+": "AB_PLUS",
	"AB-": "AB_MINUS",
	"O+": "O_PLUS",
	"O-": "O_MINUS",
};

const AVAILABILITY_OPTIONS = [
	{ value: "weekdays", label: "Weekdays" },
	{ value: "weekends", label: "Weekends" },
	{ value: "mornings", label: "Mornings" },
	{ value: "afternoons", label: "Afternoons" },
	{ value: "evenings", label: "Evenings" },
	{ value: "anytime", label: "Anytime" },
] as const;

const PHONE_PATTERN = /^\+?[0-9\s-]{10,15}$/;

interface ProfileForm {
	name: string;
	phone: string;
	bloodGroup: string;
	location: string;
	availability: string;
	heightCm: string;
	weightKg: string;
	bloodPressure: string;
	restingHeartRate: string;
}

interface DonorProfileData {
	name?: string | null;
	phone?: string | null;
	bloodGroup?: string | null;
	location?: string | null;
	availability?: string | null;
	updatedHealthInfo?: unknown;
}

const EMPTY_FORM: ProfileForm = {
	name: "",
	phone: "",
	bloodGroup: "",
	location: "",
	availability: "",
	heightCm: "",
	weightKg: "",
	bloodPressure: "",
	restingHeartRate: "",
};

function isBloodGroupLabel(value: string): value is BloodGroupLabel {
	return (BLOOD_GROUPS as readonly string[]).includes(value);
}

function healthText(health: Record<string, unknown>, key: string): string {
	const value = health[key];
	if (typeof value === "string") return value;
	if (value != null) return String(value);
	return "";
}

function formFromUser(user: DonorProfileData): ProfileForm {
	const health = (user.updatedHealthInfo ?? {}) as Record<string, unknown>;
	const bloodGroup = displayBloodGroup(user.bloodGroup ?? null);
	return {
		name: user.name ?? "",
		phone: user.phone ?? "",
		bloodGroup: isBloodGroupLabel(bloodGroup) ? bloodGroup : "",
		location: user.location ?? "",
		availability: user.availability ?? "",
		heightCm: healthText(health, "height_cm"),
		weightKg: healthText(health, "weight_kg"),
		bloodPressure: healthText(health, "blood_pressure"),
		restingHeartRate: healthText(health, "resting_heart_rate"),
	};
}

function validateForm(form: ProfileForm): string | null {
	if (!form.name.trim()) return "Please enter your full name";
	if (!PHONE_PATTERN.test(form.phone.trim()))
		return "Enter a valid phone number, e.g. +234 800 000 0000";
	if (!form.bloodGroup) return "Please select your blood group";
	if (!form.location.trim()) return "Please enter your location";
	if (!form.availability) return "Please select your availability";
	if (
		!form.heightCm.trim() ||
		!form.weightKg.trim() ||
		!form.bloodPressure.trim() ||
		!form.restingHeartRate.trim()
	)
		return "Please fill in all health metrics";
	return null;
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div>
				<h2 className="text-base font-bold tracking-tight text-foreground">
					{title}
				</h2>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
			{children}
		</section>
	);
}

function Field({
	label,
	required,
	children,
}: {
	label: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-2 block text-xs font-mono uppercase tracking-wider text-muted-foreground">
				{label} {required && <span className="text-brand">*</span>}
			</label>
			{children}
		</div>
	);
}

function SelectGrid({
	options,
	value,
	onChange,
	columns = 2,
}: {
	options: ReadonlyArray<{ value: string; label: string }>;
	value: string;
	onChange: (value: string) => void;
	columns?: 2 | 4;
}) {
	return (
		<div className={cn("grid gap-2", columns === 4 ? "grid-cols-4" : "grid-cols-2")}>
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={cn(
						"cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
						value === opt.value
							? "border-brand bg-brand-light text-brand"
							: "border-border bg-muted text-muted-foreground hover:border-brand/50",
					)}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function CompletionCard({ done, total }: { done: number; total: number }) {
	const complete = done === total;
	return (
		<div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
			<div className="flex items-center justify-between gap-3">
				<p className="text-sm font-semibold text-foreground">
					{complete ? "Profile complete" : `${done} of ${total} sections complete`}
				</p>
				<span
					className={cn(
						"rounded-full border px-2.5 py-0.5 text-xs font-semibold",
						complete
							? "bg-status-ok-bg text-status-ok border-status-ok/20"
							: "bg-status-low-bg text-status-low border-status-low/20",
					)}
				>
					{complete ? "Complete" : "Incomplete"}
				</span>
			</div>
			<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-brand transition-all"
					style={{ width: `${(done / total) * 100}%` }}
				/>
			</div>
		</div>
	);
}

export function DonorProfileClient() {
	const { data: session, isPending: sessionLoading } = authClient.useSession();
	const { data: user, isLoading: userLoading } = useDonorDashboard();
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
	const [initialized, setInitialized] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (user && !initialized) {
			setForm(formFromUser(user));
			setInitialized(true);
		}
	}, [user, initialized]);

	const completion = useMemo(() => {
		const sections = [
			form.name.trim() !== "",
			PHONE_PATTERN.test(form.phone.trim()),
			form.bloodGroup !== "",
			form.location.trim() !== "",
			form.availability !== "",
			form.heightCm.trim() !== "" &&
				form.weightKg.trim() !== "" &&
				form.bloodPressure.trim() !== "" &&
				form.restingHeartRate.trim() !== "",
		];
		const done = sections.filter(Boolean).length;
		return { done, total: sections.length };
	}, [form]);

	const setText =
		(key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }));

	const setChoice = (key: keyof ProfileForm) => (value: string) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id) return;

		const error = validateForm(form);
		if (error) {
			toast.error(error);
			return;
		}

		setIsSaving(true);
		try {
			const existingHealth =
				(user?.updatedHealthInfo ?? {}) as Record<string, unknown>;
			await updateUserProfile(session.user.id, {
				name: form.name.trim(),
				phone: form.phone.trim(),
				bloodGroup: BG_TO_ENUM[form.bloodGroup as BloodGroupLabel] as never,
				location: form.location.trim(),
				availability: form.availability as never,
				updatedHealthInfo: {
					...existingHealth,
					height_cm: form.heightCm.trim(),
					weight_kg: form.weightKg.trim(),
					blood_pressure: form.bloodPressure.trim(),
					resting_heart_rate: form.restingHeartRate.trim(),
				},
			});
			await queryClient.invalidateQueries({
				queryKey: ["donor-dashboard", session.user.id],
			});
			toast.success("Profile saved. You can now respond to emergency requests.");
		} catch {
			toast.error("Failed to save profile. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	if (sessionLoading || userLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<p className="text-sm text-muted-foreground">Sign in to view your profile</p>
		);
	}

	return (
		<div className="mx-auto w-full max-w-4xl space-y-8">
			<div className="space-y-1.5">
				<Link
					href="/donor"
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Back to dashboard
				</Link>
				<h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
					Donor Profile
				</h1>
				<p className="text-sm text-muted-foreground">
					Keep your details up to date so hospitals can match you with nearby
					emergencies.
				</p>
			</div>

			<CompletionCard done={completion.done} total={completion.total} />

			<form onSubmit={handleSubmit} className="space-y-6">
				<Section
					title="Personal details"
					description="How hospitals identify and reach you."
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="Full Name" required>
							<Input
								type="text"
								value={form.name}
								onChange={setText("name")}
								placeholder="e.g. David Adebayo"
								autoComplete="name"
							/>
						</Field>
						<Field label="Phone Number" required>
							<Input
								type="tel"
								value={form.phone}
								onChange={setText("phone")}
								placeholder="+234 800 000 0000"
								autoComplete="tel"
							/>
						</Field>
					</div>
					<Field label="Email">
						<Input type="email" value={session.user.email ?? ""} disabled />
					</Field>
				</Section>

				<Section
					title="Donation profile"
					description="Used to match you with nearby emergency requests."
				>
					<Field label="Blood Group" required>
						<SelectGrid
							options={BLOOD_GROUP_OPTIONS}
							value={form.bloodGroup}
							onChange={setChoice("bloodGroup")}
							columns={4}
						/>
					</Field>
					<Field label="Your Location" required>
						<Input
							type="text"
							value={form.location}
							onChange={setText("location")}
							placeholder="e.g. Lagos, Nigeria"
						/>
					</Field>
					<Field label="Availability" required>
						<SelectGrid
							options={AVAILABILITY_OPTIONS}
							value={form.availability}
							onChange={setChoice("availability")}
						/>
					</Field>
				</Section>

				<Section
					title="Health info"
					description="Basic health metrics to ensure safe matching."
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field label="Height (cm)" required>
							<Input
								type="text"
								inputMode="numeric"
								value={form.heightCm}
								onChange={setText("heightCm")}
								placeholder="170"
							/>
						</Field>
						<Field label="Weight (kg)" required>
							<Input
								type="text"
								inputMode="numeric"
								value={form.weightKg}
								onChange={setText("weightKg")}
								placeholder="70"
							/>
						</Field>
						<Field label="Blood Pressure" required>
							<Input
								type="text"
								value={form.bloodPressure}
								onChange={setText("bloodPressure")}
								placeholder="120/80"
							/>
						</Field>
						<Field label="Resting Heart Rate" required>
							<Input
								type="text"
								inputMode="numeric"
								value={form.restingHeartRate}
								onChange={setText("restingHeartRate")}
								placeholder="72"
							/>
						</Field>
					</div>
				</Section>

				<Button
					type="submit"
					disabled={isSaving}
					className="w-full rounded-2xl py-6 text-sm font-medium"
				>
					{isSaving ? "Saving..." : "Save Profile"}
				</Button>
			</form>
		</div>
	);
}
