"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserById, updateUserProfile } from "@/servers/user";
import { getAncestors } from "@/servers/location";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocationCascade } from "@/hooks/use-location-cascade";
import { IdentitySection } from "@/components/donor/health-profile/identity-section";
import { EmergencyPreferencesSection } from "@/components/donor/health-profile/emergency-preferences-section";
import { VitalsSection } from "@/components/donor/health-profile/vitals-section";
import { MedicalHistorySection } from "@/components/donor/health-profile/medical-history-section";
import { EligibilityScreeningSection } from "@/components/donor/health-profile/eligibility-screening-section";
import { LastScreeningSection } from "@/components/donor/health-profile/last-screening-section";
import {
	EMPTY_HEALTH,
	type HealthInfo,
} from "@/components/donor/health-profile/types";
import type { Availability } from "@generated/prisma/enums";

interface ProfileFormState {
	full_name: string;
	blood_group: string;
	genotype: string;
	last_donation_date: string;
	location: string;
	locationId: string;
	availability: Availability | "";
	isActive: boolean;
	health: HealthInfo;
}

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
		availability: "",
		isActive: true,
		health: EMPTY_HEALTH,
	});

	const [formReady, setFormReady] = useState(false);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const cascade = useLocationCascade();

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
					const ancestors = await getAncestors(user.locationId);
					for (const a of ancestors) {
						if (a.type === "region") regionId = a.id;
						else if (a.type === "state") stateId = a.id;
						else if (a.type === "city") cityId = a.id;
					}
				}
				cascade.setAll(regionId, stateId, cityId);

				setForm({
					full_name: user.name ?? "",
					blood_group: user.bloodGroup ?? "",
					genotype: user.genotype ?? "",
					last_donation_date: user.lastDonationDate
						? user.lastDonationDate.toString()
						: "",
					location: user.location ?? "",
					locationId: user.locationId ?? "",
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
				locationId: cascade.locationId || form.locationId || undefined,
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
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
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

	return (
		<div className="max-w-3xl space-y-8">
			<header>
				<h1 className="text-2xl font-bold text-foreground">
					Health Profile
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Keep this accurate — hospitals rely on it to confirm safe,
					eligible matches.
				</p>
			</header>

			<form onSubmit={handleSave} className="space-y-6">
				<IdentitySection
					fullName={form.full_name}
					onFullNameChange={(v) =>
						setForm({ ...form, full_name: v })
					}
					bloodGroup={form.blood_group}
					onBloodGroupChange={(v) =>
						setForm({ ...form, blood_group: v })
					}
					genotype={form.genotype}
					onGenotypeChange={(v) => setForm({ ...form, genotype: v })}
					lastDonationDate={form.last_donation_date}
					onLastDonationDateChange={(v) =>
						setForm({ ...form, last_donation_date: v })
					}
				/>

				<EmergencyPreferencesSection
					cascade={cascade}
					availability={form.availability}
					onAvailabilityChange={(v) =>
						setForm({ ...form, availability: v })
					}
					isActive={form.isActive}
					onIsActiveChange={(v) => setForm({ ...form, isActive: v })}
				/>

				<VitalsSection health={form.health} updateHealth={updateHealth} />
				<MedicalHistorySection
					health={form.health}
					updateHealth={updateHealth}
				/>
				<EligibilityScreeningSection
					health={form.health}
					updateHealth={updateHealth}
				/>
				<LastScreeningSection
					health={form.health}
					updateHealth={updateHealth}
				/>

				<div className="flex items-center gap-3">
					<button
						type="submit"
						disabled={saving}
						className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
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
