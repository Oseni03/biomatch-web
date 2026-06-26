"use client";

import { useState, useEffect } from "react";
import {
	Droplet,
	Ruler,
	Weight,
	Activity,
	Pill,
	AlertTriangle,
	CalendarClock,
	Save,
	Loader2,
	CheckCircle2,
	MapPin,
	Clock,
	Bell,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserById, updateUserProfile } from "@/servers/user";
import { getLocations } from "@/servers/location";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/section-card";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"];

interface HealthInfo {
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

interface ProfileFormState {
	full_name: string;
	blood_group: string;
	genotype: string;
	last_donation_date: string;
	location: string;
	locationId: string;
	regionId: string;
	stateId: string;
	cityId: string;
	availability: string;
	isActive: boolean;
	health: HealthInfo;
}

const EMPTY_HEALTH: HealthInfo = {
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

export default function HealthProfilePage() {
	const { data: session, isPending: sessionLoading } =
		authClient.useSession();
	const [form, setForm] = useState<ProfileFormState>({
		full_name: "",
		blood_group: "",
		genotype: "",
		last_donation_date: "",
		location: "",
		locationId: "",
		regionId: "",
		stateId: "",
		cityId: "",
		availability: "",
		isActive: true,
		health: EMPTY_HEALTH,
	});

	const [formReady, setFormReady] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
	const [states, setStates] = useState<{ id: string; name: string }[]>([]);
	const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

	useEffect(() => {
		getLocations(null).then(setRegions);
	}, []);

	useEffect(() => {
		if (form.regionId) {
			getLocations(form.regionId).then(setStates);
		}
	}, [form.regionId]);

	useEffect(() => {
		if (form.stateId) {
			getLocations(form.stateId).then(setCities);
		}
	}, [form.stateId]);

	useEffect(() => {
		if (form.cityId) {
			setForm((prev) => ({ ...prev, locationId: form.cityId }));
		}
	}, [form.cityId]);

	const { isLoading: profileLoading } = useQuery({
		queryKey: ["health-profile", session?.user?.id],
		queryFn: async () => {
			const user = await getUserById(session!.user!.id);
			if (user) {
				const existingHealth = (user.updatedHealthInfo ??
					{}) as Partial<HealthInfo>;

				let regionId = "";
				let stateId = "";
				let cityId = "";

				if (user.locationId) {
					const ancestors = await import("@/servers/location").then(
						(m) => m.getAncestors(user.locationId!),
					);
					for (const a of ancestors) {
						if (a.type === "region") regionId = a.id;
						else if (a.type === "state") stateId = a.id;
						else if (a.type === "city") cityId = a.id;
					}
				}

				setForm({
					full_name: user.name ?? "",
					blood_group: user.bloodGroup ?? "",
					genotype: user.genotype ?? "",
					last_donation_date: user.lastDonationDate
						? user.lastDonationDate.toString()
						: "",
					location: user.location ?? "",
					locationId: user.locationId ?? "",
					regionId,
					stateId,
					cityId,
					availability: user.availability ?? "",
					isActive: user.isActive ?? true,
					health: { ...EMPTY_HEALTH, ...existingHealth },
				});
				setFormReady(true);
			}
			return user;
		},
		enabled: !!session?.user?.id && !formReady,
	});

	const updateHealth = <K extends keyof HealthInfo>(
		key: K,
		value: HealthInfo[K],
	) => {
		setForm((prev) => ({
			...prev,
			health: { ...prev.health, [key]: value },
		}));
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!session?.user?.id) return;

		setSaving(true);
		setSaved(false);

		try {
			await updateUserProfile(session.user.id, {
				name: form.full_name,
				bloodGroup: form.blood_group as any,
				genotype: form.genotype || undefined,
				lastDonationDate: form.last_donation_date
					? new Date(form.last_donation_date)
					: undefined,
				updatedHealthInfo: form.health,
				location: form.location || undefined,
				locationId: form.locationId || undefined,
				availability: form.availability || undefined,
				isActive: form.isActive,
			});

			setSaved(true);
			toast.success("Health profile saved");
			setTimeout(() => setSaved(false), 3000);
		} catch {
			toast.error("Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	const loading = sessionLoading || profileLoading;

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="flex h-64 items-center justify-center">
				<p>Sign in to view your health profile</p>
			</div>
		);
	}

	const inputClass =
		"mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-400";

	return (
		<div className="max-w-3xl space-y-8">
			<header>
				<h1 className="text-2xl font-bold text-gray-900">
					Health Profile
				</h1>
				<p className="mt-1 text-sm text-gray-500">
					Keep this accurate — hospitals rely on it to confirm safe,
					eligible matches.
				</p>
			</header>

			<form onSubmit={handleSave} className="space-y-6">
				<SectionCard icon={Droplet} title="Identity & Blood Type">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Full name">
							<input
								required
								value={form.full_name}
								onChange={(e) =>
									setForm({
										...form,
										full_name: e.target.value,
									})
								}
								className={inputClass}
							/>
						</Field>
						<Field label="Blood group">
							<select
								value={form.blood_group}
								onChange={(e) =>
									setForm({
										...form,
										blood_group: e.target.value,
									})
								}
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
								value={form.genotype}
								onChange={(e) =>
									setForm({
										...form,
										genotype: e.target.value,
									})
								}
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
								value={form.last_donation_date}
								onChange={(e) =>
									setForm({
										...form,
										last_donation_date: e.target.value,
									})
								}
								className={inputClass}
							/>
						</Field>
					</div>
				</SectionCard>

				<SectionCard icon={MapPin} title="Emergency Preferences">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Region" icon={MapPin}>
							<select
								value={form.regionId}
								onChange={(e) =>
									setForm({
										...form,
										regionId: e.target.value,
										stateId: "",
										cityId: "",
										locationId: "",
									})
								}
								className={inputClass}
							>
								<option value="">Select region</option>
								{regions.map((r) => (
									<option key={r.id} value={r.id}>
										{r.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="State">
							<select
								value={form.stateId}
								onChange={(e) =>
									setForm({
										...form,
										stateId: e.target.value,
										cityId: "",
										locationId: "",
									})
								}
								disabled={!form.regionId}
								className={inputClass}
							>
								<option value="">Select state</option>
								{states.map((s) => (
									<option key={s.id} value={s.id}>
										{s.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="City / Area">
							<select
								value={form.cityId}
								onChange={(e) =>
									setForm({ ...form, cityId: e.target.value })
								}
								disabled={!form.stateId}
								className={inputClass}
							>
								<option value="">Select city</option>
								{cities.map((c) => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</Field>
						<Field label="Availability" icon={Clock}>
							<input
								value={form.availability}
								onChange={(e) =>
									setForm({
										...form,
										availability: e.target.value,
									})
								}
								className={inputClass}
								placeholder="e.g. weekends, evenings"
							/>
						</Field>
					</div>
					<label className="mt-4 flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={!form.isActive}
							onChange={(e) =>
								setForm({
									...form,
									isActive: !e.target.checked,
								})
							}
							className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
						/>
						<span className="flex items-center gap-1.5 text-sm text-gray-700">
							<Bell className="h-3.5 w-3.5 text-gray-400" />
							Pause emergency alerts
						</span>
					</label>
					<p className="mt-1.5 text-xs text-gray-400">
						When paused, you won&apos;t receive emergency donation
						requests.
					</p>
				</SectionCard>

				<SectionCard icon={Activity} title="Vitals">
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Height (cm)" icon={Ruler}>
							<input
								type="number"
								min="0"
								value={form.health.height_cm}
								onChange={(e) =>
									updateHealth("height_cm", e.target.value)
								}
								className={inputClass}
							/>
						</Field>
						<Field label="Weight (kg)" icon={Weight}>
							<input
								type="number"
								min="0"
								value={form.health.weight_kg}
								onChange={(e) =>
									updateHealth("weight_kg", e.target.value)
								}
								className={inputClass}
							/>
						</Field>
						<Field label="Blood pressure (e.g. 120/80)">
							<input
								value={form.health.blood_pressure}
								onChange={(e) =>
									updateHealth(
										"blood_pressure",
										e.target.value,
									)
								}
								className={inputClass}
								placeholder="120/80"
							/>
						</Field>
						<Field label="Resting heart rate (bpm)">
							<input
								type="number"
								min="0"
								value={form.health.resting_heart_rate}
								onChange={(e) =>
									updateHealth(
										"resting_heart_rate",
										e.target.value,
									)
								}
								className={inputClass}
							/>
						</Field>
					</div>
				</SectionCard>

				<SectionCard icon={Pill} title="Medical History">
					<div className="grid gap-4">
						<Field label="Chronic conditions">
							<textarea
								value={form.health.chronic_conditions}
								onChange={(e) =>
									updateHealth(
										"chronic_conditions",
										e.target.value,
									)
								}
								className={`${inputClass} min-h-[72px]`}
								placeholder="e.g. hypertension, diabetes — leave blank if none"
							/>
						</Field>
						<Field label="Allergies">
							<textarea
								value={form.health.allergies}
								onChange={(e) =>
									updateHealth("allergies", e.target.value)
								}
								className={`${inputClass} min-h-[72px]`}
								placeholder="e.g. penicillin, latex — leave blank if none"
							/>
						</Field>
						<Field label="Current medications">
							<textarea
								value={form.health.current_medications}
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
								value={form.health.recent_surgery_or_illness}
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

				<SectionCard icon={AlertTriangle} title="Eligibility Screening">
					<div className="space-y-3">
						<Checkbox
							label="Currently pregnant or nursing"
							checked={form.health.is_pregnant_or_nursing}
							onChange={(v) =>
								updateHealth("is_pregnant_or_nursing", v)
							}
						/>
						<Checkbox
							label="Smokes or uses tobacco products"
							checked={form.health.smokes_or_uses_tobacco}
							onChange={(v) =>
								updateHealth("smokes_or_uses_tobacco", v)
							}
						/>
						<Checkbox
							label="Traveled to a malaria-risk area in the last 12 months"
							checked={form.health.travel_history_malaria_zone}
							onChange={(v) =>
								updateHealth("travel_history_malaria_zone", v)
							}
						/>
					</div>
				</SectionCard>

				<SectionCard
					icon={CalendarClock}
					title="Last Medical Screening"
				>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Screening date">
							<input
								type="date"
								value={form.health.last_screening_date}
								onChange={(e) =>
									updateHealth(
										"last_screening_date",
										e.target.value,
									)
								}
								className={inputClass}
							/>
						</Field>
						<Field
							label="Notes / results"
							className="sm:col-span-2"
						>
							<textarea
								value={form.health.last_screening_notes}
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

				<div className="flex items-center gap-3">
					<button
						type="submit"
						disabled={saving}
						className="flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
					>
						{saving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Save Health Profile
					</button>
					{saved && (
						<span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
							<CheckCircle2 className="h-4 w-4" />
							Saved
						</span>
					)}
				</div>
			</form>
		</div>
	);
}

function Field({
	label,
	icon: Icon,
	className,
	children,
}: {
	label: string;
	icon?: React.ElementType;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<label className={`block ${className ?? ""}`}>
			<span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
				{Icon && <Icon className="h-3.5 w-3.5" />}
				{label}
			</span>
			{children}
		</label>
	);
}

function Checkbox({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (value: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2.5 text-sm text-gray-700">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-400"
			/>
			{label}
		</label>
	);
}
