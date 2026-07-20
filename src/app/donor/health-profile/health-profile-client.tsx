"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserById, updateUserProfile } from "@/servers/user";
import { getAncestors } from "@/servers/location";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLocationCascade } from "@/hooks/use-location-cascade";
import { DashboardGreeting } from "@/components/brand/dashboard-greeting";
import { Button } from "@/components/ui/button";
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

export function HealthProfileClient() {
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

	const { data: profileData, isLoading: profileLoading } = useQuery({
		queryKey: ["health-profile", session?.user?.id],
		queryFn: () => getUserById(session!.user!.id),
		enabled: !!session?.user?.id,
	});

	useEffect(() => {
		if (!profileData || formReady) return;

		let cancelled = false;

		(async () => {
			const existingHealth = (profileData.updatedHealthInfo ??
				{}) as Partial<HealthInfo>;

			let regionId = "";
			let stateId = "";
			let cityId = "";

			if (profileData.locationId) {
				const ancestors = await getAncestors(profileData.locationId);
				for (const a of ancestors) {
					if (a.type === "region") regionId = a.id;
					else if (a.type === "state") stateId = a.id;
					else if (a.type === "city") cityId = a.id;
				}
			}
			if (cancelled) return;
			cascade.setAll(regionId, stateId, cityId);

			setForm({
				full_name: profileData.name ?? "",
				blood_group: profileData.bloodGroup ?? "",
				genotype: profileData.genotype ?? "",
				last_donation_date: profileData.lastDonationDate
					? profileData.lastDonationDate.toString()
					: "",
				location: profileData.location ?? "",
				locationId: profileData.locationId ?? "",
				availability: profileData.availability ?? "",
				isActive: profileData.isActive ?? true,
				health: { ...EMPTY_HEALTH, ...existingHealth },
			});
			setFormReady(true);
		})();

		return () => {
			cancelled = true;
		};
	}, [profileData, formReady]);

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
			<DashboardGreeting
				title="Health Profile"
				subtitle="Keep this accurate — hospitals rely on it to confirm safe, eligible matches."
			/>

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
					<Button type="submit" disabled={saving}>
						{saving ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Save className="h-4 w-4" />
						)}
						Save Health Profile
					</Button>
					{saved && (
						<span className="flex items-center gap-1.5 text-sm font-medium text-status-ok">
							<CheckCircle2 className="h-4 w-4" />
							Saved
						</span>
					)}
				</div>
			</form>
		</div>
	);
}
